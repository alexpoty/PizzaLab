import { describe, expect, it } from 'vitest'
import { defaultForm, defaultMetadata } from '../data/doughDefaults'
import type { FormState } from '../types/dough'
import { buildFermentationTimeline } from './fermentationTimeline'

describe('buildFermentationTimeline', () => {
  it('uses preset values for direct cold fermentation', () => {
    const startedAt = new Date(2026, 3, 30, 9, 30)
    const form: FormState = {
      ...defaultForm,
      doughMethod: 'DIRECT',
      fermentationPreset: 'COLD_24H',
      fermentationSchedule: null,
      coldTemperatureCelsius: 5,
    }
    const selectedPreset = defaultMetadata.fermentationPresets.find(
      (preset) => preset.code === 'COLD_24H',
    )

    const timeline = buildFermentationTimeline(form, selectedPreset, startedAt)

    expect(timeline).toEqual([
      {
        key: 'mix',
        title: 'Mix dough',
        timestamp: '30 Apr · 09:30',
      },
      {
        key: 'cold-ferment',
        title: 'Cold ferment',
        timestamp: '1 May · 09:30',
        durationLabel: '24h at 5C',
        timeRangeLabel: '30 Apr · 09:30 to 1 May · 09:30',
      },
      {
        key: 'ready',
        title: 'Ready to bake',
        timestamp: '1 May · 09:30',
      },
    ])
  })

  it('builds preferment timeline with final mix for mixed manual schedule', () => {
    const startedAt = new Date(2026, 3, 30, 8, 0)
    const form: FormState = {
      ...defaultForm,
      doughMethod: 'POOLISH',
      fermentationPreset: 'POOLISH_ROOM_16H_COLD_24H',
      fermentationSchedule: {
        mode: 'MIXED',
        roomHours: 16,
        roomTemperatureCelsius: 20,
        coldHours: 24,
        coldTemperatureCelsius: 4,
      },
      prefermentFlourPercent: 30,
    }

    const timeline = buildFermentationTimeline(form, undefined, startedAt)

    expect(timeline).toEqual([
      {
        key: 'mix-preferment',
        title: 'Mix poolish',
        timestamp: '30 Apr · 08:00',
      },
      {
        key: 'preferment-ferment',
        title: 'Ferment poolish',
        timestamp: '1 May · 00:00',
        durationLabel: '16h at 20C',
        timeRangeLabel: '30 Apr · 08:00 to 1 May · 00:00',
      },
      {
        key: 'final-mix',
        title: 'Final mix',
        timestamp: '1 May · 00:00',
      },
      {
        key: 'cold-ferment',
        title: 'Cold ferment',
        timestamp: '2 May · 00:00',
        durationLabel: '24h at 4C',
        timeRangeLabel: '1 May · 00:00 to 2 May · 00:00',
      },
      {
        key: 'ready',
        title: 'Ready to bake',
        timestamp: '2 May · 00:00',
      },
    ])
  })
})
