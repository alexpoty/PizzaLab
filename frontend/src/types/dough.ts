export type DoughMethod = 'DIRECT' | 'POOLISH' | 'BIGA'

export type YeastType = 'INSTANT' | 'ACTIVE_DRY' | 'FRESH'

export type FermentationPreset =
  | 'ROOM_24H'
  | 'COLD_24H'
  | 'COLD_48H'
  | 'POOLISH_ROOM_16H_COLD_24H'
  | 'BIGA_ROOM_16H_COLD_24H'

export type PresetMetadata = {
  code: FermentationPreset
  label: string
  compatibleDoughMethods: DoughMethod[]
  requiresRoomTemperature: boolean
  requiresColdTemperature: boolean
  roomHours: number
  coldHours: number
}

export type DoughMetadata = {
  doughMethods: DoughMethod[]
  yeastTypes: YeastType[]
  fermentationPresets: PresetMetadata[]
}

export type IngredientGroup = {
  flourGrams: number
  waterGrams: number
  saltGrams?: number
  yeastGrams: number
}

export type DoughCalculationResponse = {
  flourGrams: number
  waterGrams: number
  saltGrams: number
  yeastGrams: number
  totalDoughWeightGrams: number
  preferment: IngredientGroup | null
  finalMix: IngredientGroup
  yeastCalculation: {
    yeastType: YeastType
    doughMethod: DoughMethod
    roomEffectHours: number
    coldEffectHours: number
    effectiveFermentationHours: number
    freshYeastPercent: number
    selectedYeastPercent: number
    freshYeastEquivalentGrams: number
    selectedYeastGrams: number
    prefermentYeastGrams: number
    finalMixYeastGrams: number
  }
}

export type FormState = {
  pizzaCount: number
  doughBallWeightGrams: number
  hydrationPercent: number
  saltPercent: number
  yeastType: YeastType
  doughMethod: DoughMethod
  fermentationPreset: FermentationPreset
  roomTemperatureCelsius: number
  coldTemperatureCelsius: number
  prefermentFlourPercent: number
}

export type DoughCalculationRequest = {
  pizzaCount: number
  doughBallWeightGrams: number
  hydrationPercent: number
  saltPercent: number
  yeastType: YeastType
  doughMethod: DoughMethod
  fermentationPreset: FermentationPreset
  roomTemperatureCelsius?: number
  coldTemperatureCelsius?: number
  prefermentFlourPercent?: number
}
