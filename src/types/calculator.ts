export interface BusbarSize {
  id: string;
  width: number;     // mm
  thickness: number; // mm
  label: string;
}

export interface MaterialGrade {
  id: string;
  label: string;
  standard: string;
  purity: number;    // e.g. 0.999
  density: number;   // g/cm³
  description: string;
}

export interface CopperPriceData {
  pricePerLb: number;
  pricePerKg: number;
  pricePerMT: number;
  currency: string;
  source: string;
  isFallback: boolean;
  updatedAt: string;
}

export interface CalculationResult {
  volumePerMeter: number;  // cm³/m
  weightPerMeter: number;  // kg/m
  costPerMeter: number;    // $/m
  costPerM2: number;       // $/m²
  pricePerKg: number;      // $/kg used
}
