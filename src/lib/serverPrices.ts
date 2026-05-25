import { fetchWithRetry } from './fetchWithRetry';
import type { CopperPriceData, FxRates } from '@/types/calculator';

const COPPER_URL   = 'https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1d&range=1d';
const ALUMINUM_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/ALI=F?interval=1d&range=1d';
const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD';

const PEGGED: Record<string, number> = {
  AED: 3.6725, SAR: 3.7500, QAR: 3.6400, KWD: 0.3075, BHD: 0.3760,
};

const FALLBACK_FX: Record<string, number> = {
  EUR: 0.91,  GBP: 0.77,  CHF: 0.87,  JPY: 145.00, CAD: 1.42,
  AUD: 1.59,  CNY: 7.28,  INR: 85.00, SGD: 1.34,   KRW: 1380.0,
  TRY: 38.50, BRL: 5.75,  MXN: 18.50, NOK: 10.85,  SEK: 10.40,
  ZAR: 18.50,
  ...PEGGED,
};

const WANTED_FX = [
  'EUR','GBP','CHF','JPY','CAD','AUD','CNY','INR','SGD','KRW','TRY','BRL','MXN','NOK','SEK','ZAR',
];

export async function fetchCopperPrice(): Promise<CopperPriceData> {
  const FALLBACK_LB = 4.50;
  try {
    const res = await fetchWithRetry(COPPER_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next:    { revalidate: 300 },
    });
    const json = await res.json();
    const pricePerLb: number | undefined = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!pricePerLb || pricePerLb <= 0) throw new Error('bad data');
    const pricePerKg = pricePerLb * 2.20462;
    return {
      pricePerLb: +pricePerLb.toFixed(4),
      pricePerKg: +pricePerKg.toFixed(3),
      pricePerMT: +pricePerKg.toFixed(0) * 1000,
      currency: 'USD', source: 'COMEX HG=F', isFallback: false,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    const pricePerKg = FALLBACK_LB * 2.20462;
    return {
      pricePerLb: FALLBACK_LB,
      pricePerKg: +pricePerKg.toFixed(3),
      pricePerMT: +pricePerKg.toFixed(0) * 1000,
      currency: 'USD', source: 'estimated', isFallback: true,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchAluminumPrice(): Promise<CopperPriceData> {
  const FALLBACK_MT = 2500;
  try {
    const res = await fetchWithRetry(ALUMINUM_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next:    { revalidate: 300 },
    });
    const json = await res.json();
    const rawPrice: number | undefined = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!rawPrice || rawPrice <= 0) throw new Error('bad data');
    let pricePerKg: number;
    if (rawPrice > 500)     pricePerKg = rawPrice / 1000;
    else if (rawPrice < 5)  pricePerKg = rawPrice * 2.20462;
    else throw new Error('ambiguous price unit');
    const pricePerMT = Math.round(pricePerKg * 1000);
    return {
      pricePerLb: +(pricePerKg / 2.20462).toFixed(4),
      pricePerKg: +pricePerKg.toFixed(4),
      pricePerMT,
      currency: 'USD', source: 'LME ALI=F', isFallback: false,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    const pricePerKg = FALLBACK_MT / 1000;
    return {
      pricePerLb: +(pricePerKg / 2.20462).toFixed(4),
      pricePerKg: +pricePerKg.toFixed(4),
      pricePerMT: FALLBACK_MT,
      currency: 'USD', source: 'estimated', isFallback: true,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchFxRates(): Promise<FxRates> {
  try {
    const res = await fetchWithRetry(FRANKFURTER_URL, { next: { revalidate: 21600 } });
    const data = await res.json() as { rates: Record<string, number>; date: string };
    const rates: Record<string, number> = {};
    for (const code of WANTED_FX) {
      rates[code] = typeof data.rates[code] === 'number' ? data.rates[code] : FALLBACK_FX[code];
    }
    Object.assign(rates, PEGGED);
    return {
      ...rates, isFallback: false, source: 'ECB via Frankfurter',
      updatedAt: new Date().toISOString(),
    } as FxRates;
  } catch {
    return {
      ...FALLBACK_FX, isFallback: true, source: 'static fallback',
      updatedAt: new Date().toISOString(),
    } as FxRates;
  }
}
