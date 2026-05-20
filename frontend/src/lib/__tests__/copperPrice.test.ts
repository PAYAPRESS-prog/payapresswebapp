import { calculateCost, fmt, fmtUSD } from '../copperPrice';
import { BUSBAR_SIZES, MATERIAL_GRADES } from '../copperData';

const s25x3  = BUSBAR_SIZES.find(s => s.id === '25x3')!;
const s100x10= BUSBAR_SIZES.find(s => s.id === '100x10')!;
const cuETP  = MATERIAL_GRADES.find(g => g.id === 'cu-etp')!;
const cuOFE  = MATERIAL_GRADES.find(g => g.id === 'cu-ofe')!;

describe('calculateCost', () => {
  describe('25×3 mm Cu-ETP at $10/kg', () => {
    const r = calculateCost(s25x3, cuETP, 10);

    it('volume per meter = 75 cm³', () => {
      expect(r.volumePerMeter).toBe(75); // 25 × 3
    });

    it('weight per meter ≈ 0.66675 kg', () => {
      // 75 cm³ × 8.89 g/cm³ / 1000
      expect(r.weightPerMeter).toBeCloseTo(0.66675, 4);
    });

    it('cost per meter ≈ $6.67', () => {
      expect(r.costPerMeter).toBeCloseTo(6.6675, 3);
    });

    it('cost per m² ≈ $266.7', () => {
      // $6.6675 / 0.025 m
      expect(r.costPerM2).toBeCloseTo(266.7, 1);
    });
  });

  describe('100×10 mm Cu-OFE at $9.5/kg', () => {
    const r = calculateCost(s100x10, cuOFE, 9.5);

    it('volume per meter = 1000 cm³', () => {
      expect(r.volumePerMeter).toBe(1000);
    });

    it('weight per meter ≈ 8.94 kg', () => {
      // 1000 × 8.94 / 1000
      expect(r.weightPerMeter).toBeCloseTo(8.94, 3);
    });

    it('cost per meter ≈ $84.93', () => {
      expect(r.costPerMeter).toBeCloseTo(84.93, 1);
    });
  });

  it('zero price returns zero cost', () => {
    const r = calculateCost(s25x3, cuETP, 0);
    expect(r.costPerMeter).toBe(0);
    expect(r.costPerM2).toBe(0);
  });

  it('stores the effective price in result', () => {
    const r = calculateCost(s25x3, cuETP, 12.345);
    expect(r.pricePerKg).toBe(12.345);
  });
});

describe('fmt', () => {
  it('formats 0.66675 to 3dp', () => {
    expect(fmt(0.66675, 3)).toBe('0.667');
  });

  it('uses locale thousands separator for large numbers', () => {
    expect(fmt(1234.5, 1)).toContain('1,234');
  });
});

describe('fmtUSD', () => {
  it('prepends dollar sign', () => {
    expect(fmtUSD(6.67)).toBe('$6.67');
  });
});
