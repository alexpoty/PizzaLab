import type { DoughCalculationRequest } from '../types/dough'

export function formatFermentationMode(formula: DoughCalculationRequest): string {
  if (formula.fermentationSchedule) {
    return 'Manual'
  }

  if (!formula.fermentationPreset) {
    return 'Unknown'
  }

  return formula.fermentationPreset
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatFermentationSchedule(formula: DoughCalculationRequest): string | null {
  if (formula.fermentationSchedule) {
    const parts: string[] = []

    if (formula.fermentationSchedule.roomHours > 0) {
      parts.push(
        `${formula.fermentationSchedule.roomHours}h room @ ${formula.fermentationSchedule.roomTemperatureCelsius}C`,
      )
    }

    if (formula.fermentationSchedule.coldHours > 0) {
      parts.push(
        `${formula.fermentationSchedule.coldHours}h cold @ ${formula.fermentationSchedule.coldTemperatureCelsius}C`,
      )
    }

    return parts.join(', ')
  }

  const parts: string[] = []

  if (formula.roomTemperatureCelsius !== undefined) {
    parts.push(`room @ ${formula.roomTemperatureCelsius}C`)
  }

  if (formula.coldTemperatureCelsius !== undefined) {
    parts.push(`cold @ ${formula.coldTemperatureCelsius}C`)
  }

  return parts.length > 0 ? parts.join(', ') : null
}
