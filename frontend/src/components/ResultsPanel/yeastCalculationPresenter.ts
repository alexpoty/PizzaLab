import type { DoughCalculationResponse } from '../../types/dough'

type YeastCalculation = DoughCalculationResponse['yeastCalculation']

export type YeastCalculationViewModel = {
  summaryChips: string[]
  effectiveHoursText: string
  methodFactorText: string
  freshYeastPercentText: string
  selectedYeastPercentText: string
  selectedYeastLabel: string
  methodDescription: string
}

export function buildYeastCalculationViewModel(
  yeastCalculation: YeastCalculation,
): YeastCalculationViewModel {
  const effectiveHoursText = `${formatNumber(yeastCalculation.effectiveFermentationHours)} effective hours`
  const methodFactorText = `${formatNumber(yeastCalculation.methodFactor)}x`
  const freshYeastPercentText = formatPercent(yeastCalculation.freshYeastPercent)
  const selectedYeastPercentText = formatPercent(yeastCalculation.selectedYeastPercent)

  return {
    summaryChips: [
      yeastCalculation.yeastType,
      `${selectedYeastPercentText} selected`,
      `${freshYeastPercentText} fresh equivalent`,
      effectiveHoursText,
    ],
    effectiveHoursText,
    methodFactorText,
    freshYeastPercentText,
    selectedYeastPercentText,
    selectedYeastLabel: yeastTypeLabels[yeastCalculation.yeastType],
    methodDescription: methodFactorCopy[yeastCalculation.doughMethod],
  }
}

const yeastTypeLabels = {
  INSTANT: 'Instant',
  ACTIVE_DRY: 'Active dry',
  FRESH: 'Fresh',
} as const

const methodFactorCopy = {
  DIRECT: 'Direct dough keeps the full baseline, so no yeast reduction is applied.',
  POOLISH: 'Poolish uses a 0.75x factor because the preferment develops extra strength over time.',
  BIGA: 'Biga uses a 0.65x factor because this stiffer preferment needs even less yeast.',
} as const

function formatPercent(value: number) {
  return `${formatPercentNumber(value)}%`
}

function formatNumber(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function formatPercentNumber(value: number) {
  return value.toFixed(4).replace(/\.?0+$/, '')
}
