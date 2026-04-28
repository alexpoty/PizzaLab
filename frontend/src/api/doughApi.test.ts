import { describe, expect, it } from 'vitest'
import { buildCalculationRequest } from './doughApi'
import type { FormState, PresetMetadata } from '../types/dough'

const baseForm: FormState = {
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

describe('buildCalculationRequest', () => {
  it('omits unused room temperature and preferment fields for direct cold dough', () => {
    const selectedPreset: PresetMetadata = {
      code: 'COLD_24H',
      label: '24h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 24,
    }

    expect(buildCalculationRequest(baseForm, selectedPreset)).toEqual({
      pizzaCount: 4,
      doughBallWeightGrams: 270,
      hydrationPercent: 62,
      saltPercent: 3,
      yeastType: 'INSTANT',
      doughMethod: 'DIRECT',
      fermentationPreset: 'COLD_24H',
      fermentationSchedule: null,
      roomTemperatureCelsius: undefined,
      coldTemperatureCelsius: 5,
      prefermentFlourPercent: undefined,
    })
  })

  it('includes preferment and required temperatures for poolish mixed fermentation', () => {
    const form: FormState = {
      ...baseForm,
      doughMethod: 'POOLISH',
      fermentationPreset: 'POOLISH_ROOM_16H_COLD_24H',
      prefermentFlourPercent: 35,
    }
    const selectedPreset: PresetMetadata = {
      code: 'POOLISH_ROOM_16H_COLD_24H',
      label: 'Poolish 16h room + 24h cold',
      compatibleDoughMethods: ['POOLISH'],
      requiresRoomTemperature: true,
      requiresColdTemperature: true,
      roomHours: 16,
      coldHours: 24,
    }

    expect(buildCalculationRequest(form, selectedPreset)).toMatchObject({
      doughMethod: 'POOLISH',
      fermentationPreset: 'POOLISH_ROOM_16H_COLD_24H',
      roomTemperatureCelsius: 20,
      coldTemperatureCelsius: 5,
      prefermentFlourPercent: 35,
    })
  })

  it('falls back to the form preset when metadata selection is missing', () => {
    expect(buildCalculationRequest(baseForm, undefined).fermentationPreset).toBe('COLD_24H')
  })

  it('uses manual fermentation schedule instead of stale preset selection', () => {
    const form: FormState = {
      ...baseForm,
      fermentationPreset: null,
      fermentationSchedule: {
        mode: 'MIXED',
        roomHours: 16,
        roomTemperatureCelsius: 20,
        coldHours: 24,
        coldTemperatureCelsius: 4,
      },
    }
    const staleSelectedPreset: PresetMetadata = {
      code: 'COLD_24H',
      label: '24h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 24,
    }

    expect(buildCalculationRequest(form, staleSelectedPreset)).toMatchObject({
      fermentationPreset: null,
      fermentationSchedule: {
        mode: 'MIXED',
        roomHours: 16,
        roomTemperatureCelsius: 20,
        coldHours: 24,
        coldTemperatureCelsius: 4,
      },
    })
  })
})
