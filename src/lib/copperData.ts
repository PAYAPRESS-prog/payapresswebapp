import type { BusbarSize, MaterialGrade } from '@/types/calculator';

export const BUSBAR_SIZES: BusbarSize[] = [
  { id: '15x2',  width: 15,  thickness: 2,  label: '15 × 2 mm' },
  { id: '15x3',  width: 15,  thickness: 3,  label: '15 × 3 mm' },
  { id: '20x2',  width: 20,  thickness: 2,  label: '20 × 2 mm' },
  { id: '20x3',  width: 20,  thickness: 3,  label: '20 × 3 mm' },
  { id: '25x3',  width: 25,  thickness: 3,  label: '25 × 3 mm' },
  { id: '25x4',  width: 25,  thickness: 4,  label: '25 × 4 mm' },
  { id: '30x3',  width: 30,  thickness: 3,  label: '30 × 3 mm' },
  { id: '30x4',  width: 30,  thickness: 4,  label: '30 × 4 mm' },
  { id: '30x5',  width: 30,  thickness: 5,  label: '30 × 5 mm' },
  { id: '40x4',  width: 40,  thickness: 4,  label: '40 × 4 mm' },
  { id: '40x5',  width: 40,  thickness: 5,  label: '40 × 5 mm' },
  { id: '50x5',  width: 50,  thickness: 5,  label: '50 × 5 mm' },
  { id: '50x6',  width: 50,  thickness: 6,  label: '50 × 6 mm' },
  { id: '60x6',  width: 60,  thickness: 6,  label: '60 × 6 mm' },
  { id: '60x8',  width: 60,  thickness: 8,  label: '60 × 8 mm' },
  { id: '80x6',  width: 80,  thickness: 6,  label: '80 × 6 mm' },
  { id: '80x8',  width: 80,  thickness: 8,  label: '80 × 8 mm' },
  { id: '80x10', width: 80,  thickness: 10, label: '80 × 10 mm' },
  { id: '100x8', width: 100, thickness: 8,  label: '100 × 8 mm' },
  { id: '100x10',width: 100, thickness: 10, label: '100 × 10 mm' },
  { id: '120x10',width: 120, thickness: 10, label: '120 × 10 mm' },
  { id: '160x10',width: 160, thickness: 10, label: '160 × 10 mm' },
];

export const MATERIAL_GRADES: MaterialGrade[] = [
  {
    id: 'cu-etp',
    label: 'Cu-ETP',
    standard: 'EN 13601 / IEC 60317-3',
    purity: 0.9990,
    density: 8.89,
    description: '99.90% — Electrolytic Tough Pitch, most common grade',
    busbarPremium: 0,
  },
  {
    id: 'cu-of',
    label: 'Cu-OF',
    standard: 'EN 13601 / IEC 60317-37',
    purity: 0.9995,
    density: 8.92,
    description: '99.95% — Oxygen-Free, high electrical conductivity',
    busbarPremium: 0,
  },
  {
    id: 'cu-ofe',
    label: 'Cu-OFE',
    standard: 'ASTM C10100',
    purity: 0.9999,
    density: 8.94,
    description: '99.99% — Oxygen-Free Electronic, premium grade',
    busbarPremium: 0,
  },
];

export const DEFAULT_SIZE = BUSBAR_SIZES.find(s => s.id === '25x3')!;
export const DEFAULT_GRADE = MATERIAL_GRADES[0];
