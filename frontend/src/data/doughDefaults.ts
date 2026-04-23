import type { DoughMetadata, DoughMethod, FormState, YeastType } from '../types/dough'

export const defaultMetadata: DoughMetadata = {
  doughMethods: ['DIRECT', 'POOLISH', 'BIGA'],
  yeastTypes: ['INSTANT', 'ACTIVE_DRY', 'FRESH'],
  fermentationPresets: [
    {
      code: 'ROOM_24H',
      label: '24h room fermentation',
      compatibleDoughMethods: ['DIRECT', 'POOLISH', 'BIGA'],
      requiresRoomTemperature: true,
      requiresColdTemperature: false,
      roomHours: 24,
      coldHours: 0,
    },
    {
      code: 'COLD_24H',
      label: '24h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 24,
    },
    {
      code: 'COLD_48H',
      label: '48h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 48,
    },
    {
      code: 'POOLISH_ROOM_16H_COLD_24H',
      label: 'Poolish 16h room + 24h cold',
      compatibleDoughMethods: ['POOLISH'],
      requiresRoomTemperature: true,
      requiresColdTemperature: true,
      roomHours: 16,
      coldHours: 24,
    },
    {
      code: 'BIGA_ROOM_16H_COLD_24H',
      label: 'Biga 16h room + 24h cold',
      compatibleDoughMethods: ['BIGA'],
      requiresRoomTemperature: true,
      requiresColdTemperature: true,
      roomHours: 16,
      coldHours: 24,
    },
  ],
}

export const defaultForm: FormState = {
  pizzaCount: 4,
  doughBallWeightGrams: 270,
  hydrationPercent: 62,
  saltPercent: 3,
  yeastType: 'INSTANT',
  doughMethod: 'DIRECT',
  fermentationPreset: 'COLD_24H',
  fermentationSchedule: null,
  roomTemperatureCelsius: 20,
  coldTemperatureCelsius: 5,
  prefermentFlourPercent: 30,
}

export const methodLabels: Record<DoughMethod, string> = {
  DIRECT: 'Direct',
  POOLISH: 'Poolish',
  BIGA: 'Biga',
}

export const yeastLabels: Record<YeastType, string> = {
  INSTANT: 'Instant',
  ACTIVE_DRY: 'Active dry',
  FRESH: 'Fresh',
}
