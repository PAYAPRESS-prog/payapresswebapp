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
  purity: number;      // e.g. 0.999
  density: number;     // g/cm³
  description: string;
  busbarPremium: number; // fabrication + distribution premium over LME spot (decimal, e.g. 0.12 = 12%)
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

export interface FxRates {
  EUR: number; GBP: number; CHF: number; JPY: number; CAD: number; AUD: number;
  CNY: number; INR: number; SGD: number; KRW: number; TRY: number; BRL: number;
  MXN: number; NOK: number; SEK: number; ZAR: number;
  AED: number; SAR: number; QAR: number; KWD: number; BHD: number;
  isFallback: boolean; source: string; updatedAt: string;
}

export interface InitialPriceData {
  copper:   CopperPriceData | null;
  aluminum: CopperPriceData | null;
  fx:       FxRates | null;
}
