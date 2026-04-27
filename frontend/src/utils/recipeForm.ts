import type { DoughCalculationRequest, FormState } from '../types/dough'

export function applyRecipeFormulaToForm(
  current: FormState,
  formula: DoughCalculationRequest,
): FormState {
  return {
    ...current,
    pizzaCount: formula.pizzaCount,
    doughBallWeightGrams: formula.doughBallWeightGrams,
    hydrationPercent: formula.hydrationPercent,
    saltPercent: formula.saltPercent,
    yeastType: formula.yeastType,
    doughMethod: formula.doughMethod,
    fermentationPreset: formula.fermentationSchedule
      ? null
      : formula.fermentationPreset ?? current.fermentationPreset,
    fermentationSchedule: formula.fermentationSchedule ?? null,
    roomTemperatureCelsius:
      formula.roomTemperatureCelsius ??
      formula.fermentationSchedule?.roomTemperatureCelsius ??
      current.roomTemperatureCelsius,
    coldTemperatureCelsius:
      formula.coldTemperatureCelsius ??
      formula.fermentationSchedule?.coldTemperatureCelsius ??
      current.coldTemperatureCelsius,
    prefermentFlourPercent: formula.prefermentFlourPercent ?? current.prefermentFlourPercent,
  }
}
