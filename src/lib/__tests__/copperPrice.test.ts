import { calculateCost, fmt, fmtUSD, fmtCompact } from '../copperPrice';
import { BUSBAR_SIZES, MATERIAL_GRADES } from '../copperData';

const s25x3   = BUSBAR_SIZES.find(s => s.id === '25x3')!;
const s100x10 = BUSBAR_SIZES.find(s => s.id === '100x10')!;
const s15x2   = BUSBAR_SIZES.find(s => s.id === '15x2')!;
const cuETP   = MATERIAL_GRADES.find(g => g.id === 'cu-etp')!;
const cuOF    = MATERIAL_GRADES.find(g => g.id === 'cu-of')!;
const cuOFE   = MATERIAL_GRADES.find(g => g.id === 'cu-ofe')!;

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

    it('cost per m² ≈ $849.3', () => {
      // $84.93 / 0.1 m
      expect(r.costPerM2).toBeCloseTo(849.3, 0);
    });
  });

  describe('25×3 mm Cu-OF at $10/kg', () => {
    const r = calculateCost(s25x3, cuOF, 10);

    it('weight per meter is higher than Cu-ETP (density 8.92 > 8.89)', () => {
      const rETP = calculateCost(s25x3, cuETP, 10);
      expect(r.weightPerMeter).toBeGreaterThan(rETP.weightPerMeter);
    });

    it('weight per meter ≈ 0.6690 kg', () => {
      // 75 × 8.92 / 1000
      expect(r.weightPerMeter).toBeCloseTo(0.6690, 4);
    });

    it('cost per meter ≈ $6.69', () => {
      expect(r.costPerMeter).toBeCloseTo(6.690, 3);
    });
  });

  describe('15×2 mm Cu-ETP at $10/kg', () => {
    const r = calculateCost(s15x2, cuETP, 10);

    it('volume per meter = 30 cm³', () => {
      expect(r.volumePerMeter).toBe(30); // 15 × 2
    });

    it('weight per meter ≈ 0.2667 kg', () => {
      expect(r.weightPerMeter).toBeCloseTo(0.2667, 4);
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

  it('Cu-OFE has the highest density of the three grades', () => {
    expect(cuOFE.density).toBeGreaterThan(cuOF.density);
    expect(cuOF.density).toBeGreaterThan(cuETP.density);
  });
});

describe('fmt', () => {
  it('formats 0.66675 to 3dp', () => {
    expect(fmt(0.66675, 3)).toBe('0.667');
  });

  it('uses locale thousands separator for large numbers', () => {
    expect(fmt(1234.5, 1)).toContain('1,234');
  });

  it('default is 2 decimal places', () => {
    expect(fmt(3.14159)).toBe('3.14');
  });

  it('handles zero', () => {
    expect(fmt(0, 2)).toBe('0.00');
  });
});

describe('fmtUSD', () => {
  it('prepends dollar sign', () => {
    expect(fmtUSD(6.67)).toBe('$6.67');
  });

  it('rounds to 2dp by default', () => {
    expect(fmtUSD(10)).toBe('$10.00');
  });

  it('respects custom decimal places', () => {
    expect(fmtUSD(6.6675, 3)).toBe('$6.668');
  });
});

describe('fmtCompact', () => {
  it('formats values under 10 000 normally', () => {
    expect(fmtCompact(9999)).toBe('9,999.00');
  });

  it('formats 10 000 as K notation', () => {
    expect(fmtCompact(10000)).toBe('10.0K');
  });

  it('formats 1 500 000 as M notation', () => {
    expect(fmtCompact(1500000)).toBe('1.50M');
  });

  it('formats 2 000 000 000 as B notation', () => {
    expect(fmtCompact(2000000000)).toBe('2.00B');
  });

  it('handles negative values in M range', () => {
    expect(fmtCompact(-5000000)).toBe('-5.00M');
  });

  it('handles zero', () => {
    expect(fmtCompact(0)).toBe('0.00');
  });
});
