import type { BusbarSize, MaterialGrade } from '@/types/calculator';

// IEC 60317-40 / EN 13601 aluminum busbar standard sizes
export const ALUMINUM_BUSBAR_SIZES: BusbarSize[] = [
  { id: 'al-20x3',   width: 20,  thickness: 3,  label: '20 × 3 mm' },
  { id: 'al-25x3',   width: 25,  thickness: 3,  label: '25 × 3 mm' },
  { id: 'al-25x4',   width: 25,  thickness: 4,  label: '25 × 4 mm' },
  { id: 'al-30x4',   width: 30,  thickness: 4,  label: '30 × 4 mm' },
  { id: 'al-30x5',   width: 30,  thickness: 5,  label: '30 × 5 mm' },
  { id: 'al-40x5',   width: 40,  thickness: 5,  label: '40 × 5 mm' },
  { id: 'al-40x6',   width: 40,  thickness: 6,  label: '40 × 6 mm' },
  { id: 'al-50x5',   width: 50,  thickness: 5,  label: '50 × 5 mm' },
  { id: 'al-50x6',   width: 50,  thickness: 6,  label: '50 × 6 mm' },
  { id: 'al-60x6',   width: 60,  thickness: 6,  label: '60 × 6 mm' },
  { id: 'al-60x8',   width: 60,  thickness: 8,  label: '60 × 8 mm' },
  { id: 'al-80x8',   width: 80,  thickness: 8,  label: '80 × 8 mm' },
  { id: 'al-80x10',  width: 80,  thickness: 10, label: '80 × 10 mm' },
  { id: 'al-100x10', width: 100, thickness: 10, label: '100 × 10 mm' },
  { id: 'al-120x10', width: 120, thickness: 10, label: '120 × 10 mm' },
  { id: 'al-120x12', width: 120, thickness: 12, label: '120 × 12 mm' },
  { id: 'al-160x12', width: 160, thickness: 12, label: '160 × 12 mm' },
];

export const ALUMINUM_GRADES: MaterialGrade[] = [
  {
    id: 'al-1350',
    label: 'Al-1350',
    standard: 'IEC 60317-40 / ASTM B317',
    purity: 0.9950,
    density: 2.703,
    description: '99.50% — EC Grade, most common electrical busbar alloy',
    busbarPremium: 0,
  },
  {
    id: 'al-6101',
    label: 'Al-6101',
    standard: 'ASTM B317 / EN 12927',
    purity: 0.9890,
    density: 2.700,
    description: '98.9% — Heat-treatable, higher strength than 1350',
    busbarPremium: 0,
  },
  {
    id: 'al-6063',
    label: 'Al-6063',
    standard: 'EN 573-3 / ASTM B221',
    purity: 0.9800,
    density: 2.690,
    description: '98.0% — General purpose, structural grade',
    busbarPremium: 0,
  },
];

export const DEFAULT_ALUMINUM_GRADE = ALUMINUM_GRADES[0];
