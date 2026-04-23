import type {
  DoughCalculationRequest,
  DoughCalculationResponse,
  DoughMetadata,
  FormState,
  PresetMetadata,
} from '../types/dough'

export async function fetchDoughMetadata(): Promise<DoughMetadata> {
  const response = await fetch('/api/dough/metadata')

  if (!response.ok) {
    throw new Error('Metadata request failed')
  }

  return response.json()
}

export async function calculateDough(
  request: DoughCalculationRequest,
): Promise<DoughCalculationResponse> {
  const response = await fetch('/api/dough/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? 'Calculation failed')
  }

  return data
}

export function buildCalculationRequest(
  form: FormState,
  selectedPreset: PresetMetadata | undefined,
): DoughCalculationRequest {
  if (form.fermentationSchedule) {
    return {
      pizzaCount: form.pizzaCount,
      doughBallWeightGrams: form.doughBallWeightGrams,
      hydrationPercent: form.hydrationPercent,
      saltPercent: form.saltPercent,
      yeastType: form.yeastType,
      doughMethod: form.doughMethod,
      fermentationPreset: null,
      fermentationSchedule: form.fermentationSchedule,
      roomTemperatureCelsius: undefined,
      coldTemperatureCelsius: undefined,
      prefermentFlourPercent:
        form.doughMethod === 'DIRECT' ? undefined : form.prefermentFlourPercent,
    }
  }

  return {
    pizzaCount: form.pizzaCount,
    doughBallWeightGrams: form.doughBallWeightGrams,
    hydrationPercent: form.hydrationPercent,
    saltPercent: form.saltPercent,
    yeastType: form.yeastType,
    doughMethod: form.doughMethod,
    fermentationPreset: selectedPreset?.code ?? form.fermentationPreset,
    fermentationSchedule: null,
    roomTemperatureCelsius: selectedPreset?.requiresRoomTemperature
      ? form.roomTemperatureCelsius
      : undefined,
    coldTemperatureCelsius: selectedPreset?.requiresColdTemperature
      ? form.coldTemperatureCelsius
      : undefined,
    prefermentFlourPercent:
      form.doughMethod === 'DIRECT' ? undefined : form.prefermentFlourPercent,
  }
}
