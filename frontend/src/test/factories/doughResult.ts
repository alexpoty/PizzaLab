import type { DoughCalculationResponse, IngredientGroup } from '../../types/dough'

type YeastCalculationOverrides = Partial<DoughCalculationResponse['yeastCalculation']>

type DoughResultOverrides = Omit<Partial<DoughCalculationResponse>, 'finalMix' | 'preferment' | 'yeastCalculation'> & {
  preferment?: IngredientGroup | null
  finalMix?: Partial<IngredientGroup>
  yeastCalculation?: YeastCalculationOverrides
}

export function createDirectDoughResult(
  overrides: DoughResultOverrides = {},
): DoughCalculationResponse {
  const baseYeastCalculation: DoughCalculationResponse['yeastCalculation'] = {
    yeastType: 'INSTANT',
    doughMethod: 'DIRECT',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    methodFactor: 1,
    freshYeastPercent: 0.12,
    selectedYeastPercent: 0.04,
    freshYeastEquivalentGrams: 1.2,
    selectedYeastGrams: 0.4,
    prefermentYeastGrams: 0,
    finalMixYeastGrams: 0.4,
  }

  const baseFinalMix: IngredientGroup = {
    flourGrams: 1000,
    waterGrams: 650,
    saltGrams: 28,
    yeastGrams: 1.5,
  }

  return {
    flourGrams: 1000,
    waterGrams: 650,
    saltGrams: 28,
    yeastGrams: 1.5,
    totalDoughWeightGrams: 1679.5,
    ...overrides,
    preferment: overrides.preferment ?? null,
    finalMix: { ...baseFinalMix, ...overrides.finalMix },
    yeastCalculation: { ...baseYeastCalculation, ...overrides.yeastCalculation },
  }
}

export function createPrefermentDoughResult(
  overrides: DoughResultOverrides = {},
): DoughCalculationResponse {
  const basePreferment: IngredientGroup = {
    flourGrams: 276,
    waterGrams: 276,
    yeastGrams: 1.2,
  }

  const baseFinalMix: IngredientGroup = {
    flourGrams: 644,
    waterGrams: 358.8,
    saltGrams: 25.8,
    yeastGrams: 1.2,
  }

  const baseYeastCalculation: DoughCalculationResponse['yeastCalculation'] = {
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    methodFactor: 0.75,
    freshYeastPercent: 0.24,
    selectedYeastPercent: 0.08,
    freshYeastEquivalentGrams: 2.2,
    selectedYeastGrams: 0.7,
    prefermentYeastGrams: 0.35,
    finalMixYeastGrams: 0.35,
  }

  return {
    flourGrams: 920,
    waterGrams: 634.8,
    saltGrams: 25.8,
    yeastGrams: 2.4,
    totalDoughWeightGrams: 1583,
    ...overrides,
    preferment: overrides.preferment ?? basePreferment,
    finalMix: { ...baseFinalMix, ...overrides.finalMix },
    yeastCalculation: { ...baseYeastCalculation, ...overrides.yeastCalculation },
  }
}
