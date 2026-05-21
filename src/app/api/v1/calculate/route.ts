import { NextRequest, NextResponse } from 'next/server';
import { MATERIAL_GRADES } from '@/lib/copperData';
import { calculateCost } from '@/lib/copperPrice';

const CORS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const width     = parseFloat(p.get('width')     ?? '');
  const thickness = parseFloat(p.get('thickness') ?? '');
  const length    = parseFloat(p.get('length')    ?? '1000');
  const gradeId   = (p.get('grade')    ?? 'cu-etp').toLowerCase();
  const currency  = (p.get('currency') ?? 'USD').toUpperCase();
  const manualPriceRaw = p.get('copper_price');
  const manualPrice    = manualPriceRaw !== null ? parseFloat(manualPriceRaw) : null;

  // ── Validate ──────────────────────────────────────────────────────
  if (isNaN(width) || width < 5 || width > 400)
    return err(400, 'INVALID_INPUT', 'width must be between 5 and 400 mm', 'width');

  if (isNaN(thickness) || thickness < 1 || thickness > 50)
    return err(400, 'INVALID_INPUT', 'thickness must be between 1 and 50 mm', 'thickness');

  if (isNaN(length) || length < 1 || length > 100_000)
    return err(400, 'INVALID_INPUT', 'length must be between 1 and 100,000 mm', 'length');

  const grade = MATERIAL_GRADES.find(g => g.id === gradeId);
  if (!grade)
    return err(400, 'INVALID_INPUT',
      `grade must be one of: ${MATERIAL_GRADES.map(g => g.id).join(', ')}`, 'grade');

  if (manualPrice !== null && (isNaN(manualPrice) || manualPrice <= 0))
    return err(400, 'INVALID_INPUT', 'copper_price must be a positive number', 'copper_price');

  // ── Live copper price ─────────────────────────────────────────────
  let copperUSD: number;
  let priceSource: string;

  if (manualPrice !== null) {
    copperUSD   = manualPrice;
    priceSource = 'manual';
  } else {
    try {
      const r    = await fetch(new URL('/api/copper-price', req.nextUrl.origin).toString(),
                               { next: { revalidate: 300 } });
      const data = await r.json() as { pricePerKg: number; source: string };
      copperUSD   = data.pricePerKg;
      priceSource = data.source;
    } catch {
      return err(503, 'SERVICE_UNAVAILABLE',
        'Cannot fetch live copper price. Pass copper_price=<USD/kg> to use a manual value.');
    }
  }

  // ── FX rate ───────────────────────────────────────────────────────
  let fxRate   = 1;
  let fxSource = 'N/A';

  if (currency !== 'USD') {
    try {
      const r    = await fetch(new URL('/api/fx-rate', req.nextUrl.origin).toString(),
                               { next: { revalidate: 21600 } });
      const data = await r.json() as Record<string, unknown>;
      const rate = data[currency];
      if (typeof rate !== 'number' || rate <= 0)
        return err(400, 'INVALID_INPUT', `Unsupported or unknown currency: ${currency}`, 'currency');
      fxRate   = rate;
      fxSource = (data.source as string) ?? 'ECB via Frankfurter';
    } catch {
      return err(503, 'SERVICE_UNAVAILABLE', 'Cannot fetch FX rates. Use currency=USD to bypass.');
    }
  }

  // ── Calculate ─────────────────────────────────────────────────────
  const size = { id: 'custom', width, thickness, label: `${width} × ${thickness} mm` };
  const res  = calculateCost(size, grade, copperUSD);
  const Lm   = length / 1000;

  return NextResponse.json({
    input: {
      width_mm:               width,
      thickness_mm:           thickness,
      length_mm:              length,
      grade: {
        id:             grade.id,
        label:          grade.label,
        purity_percent: +(grade.purity * 100).toFixed(2),
        standard:       grade.standard,
        density_g_cm3:  grade.density,
      },
      copper_price_usd_per_kg: +copperUSD.toFixed(4),
      currency,
    },
    results: {
      cross_section_mm2:    width * thickness,
      weight_per_meter_kg:  +res.weightPerMeter.toFixed(4),
      weight_total_kg:      +(res.weightPerMeter * Lm).toFixed(4),
      cost_per_meter_usd:   +res.costPerMeter.toFixed(4),
      cost_per_m2_usd:      +res.costPerM2.toFixed(4),
      cost_total_usd:       +(res.costPerMeter * Lm).toFixed(4),
      ...(currency !== 'USD' && {
        cost_per_meter_local: +(res.costPerMeter * fxRate).toFixed(4),
        cost_per_m2_local:    +(res.costPerM2    * fxRate).toFixed(4),
        cost_total_local:     +(res.costPerMeter * Lm * fxRate).toFixed(4),
        exchange_rate: { from: 'USD', to: currency, rate: +fxRate.toFixed(6) },
      }),
    },
    meta: {
      copper_price_source: priceSource,
      ...(currency !== 'USD' && { fx_source: fxSource }),
      calculated_at: new Date().toISOString(),
      api_version:   'v1',
    },
  }, { status: 200, headers: CORS });
}

function err(status: number, code: string, message: string, field?: string) {
  return NextResponse.json(
    { error: code, message, ...(field && { field }) },
    { status, headers: CORS },
  );
}
