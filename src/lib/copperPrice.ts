import type { BusbarSize, MaterialGrade, CalculationResult } from '@/types/calculator';

export function calculateCost(
  size: BusbarSize,
  grade: MaterialGrade,
  pricePerKg: number,
): CalculationResult {
  // width(mm) × thickness(mm) × 1000(mm per meter) / 1000 = cm³/m
  const volumePerMeter = size.width * size.thickness; // cm³/m (units simplify)
  const weightPerMeter = (volumePerMeter * grade.density) / 1000; // kg/m
  const costPerMeter = weightPerMeter * pricePerKg; // $/m
  const costPerM2 = costPerMeter / (size.width / 1000); // $/m²

  return { volumePerMeter, weightPerMeter, costPerMeter, costPerM2, pricePerKg };
}

export function fmt(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtUSD(value: number, decimals = 2): string {
  return `$${fmt(value, decimals)}`;
}
