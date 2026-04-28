// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DoughResultBreakdown } from './DoughResultBreakdown'
import type { DoughCalculationResponse } from '../../types/dough'

const resultWithPreferment: DoughCalculationResponse = {
  flourGrams: 920,
  waterGrams: 634.8,
  saltGrams: 25.8,
  yeastGrams: 2.4,
  totalDoughWeightGrams: 1583,
  preferment: {
    flourGrams: 276,
    waterGrams: 276,
    yeastGrams: 1.2,
  },
  finalMix: {
    flourGrams: 644,
    waterGrams: 358.8,
    saltGrams: 25.8,
    yeastGrams: 1.2,
  },
  yeastCalculation: {
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    freshYeastPercent: 0.24,
    selectedYeastPercent: 0.08,
    freshYeastEquivalentGrams: 2.2,
    selectedYeastGrams: 0.7,
    prefermentYeastGrams: 0.35,
    finalMixYeastGrams: 0.35,
  },
}

const directResult: DoughCalculationResponse = {
  flourGrams: 1000,
  waterGrams: 650,
  saltGrams: 28,
  yeastGrams: 1.5,
  totalDoughWeightGrams: 1679.5,
  preferment: null,
  finalMix: {
    flourGrams: 1000,
    waterGrams: 650,
    saltGrams: 28,
    yeastGrams: 1.5,
  },
  yeastCalculation: {
    yeastType: 'INSTANT',
    doughMethod: 'DIRECT',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    freshYeastPercent: 0.12,
    selectedYeastPercent: 0.04,
    freshYeastEquivalentGrams: 1.2,
    selectedYeastGrams: 0.4,
    prefermentYeastGrams: 0,
    finalMixYeastGrams: 0.4,
  },
}

afterEach(() => {
  cleanup()
})

describe('DoughResultBreakdown', () => {
  it('renders total ingredients and both mix blocks for preferment dough', () => {
    render(<DoughResultBreakdown result={resultWithPreferment} layout="modal" />)

    expect(screen.getByText('Preferment')).toBeTruthy()
    expect(screen.getByText('Final mix')).toBeTruthy()
    expect(screen.getByText('920.0g')).toBeTruthy()
    expect(screen.getAllByText('276.0g').length).toBeGreaterThan(1)
    expect(screen.getByText('358.8g')).toBeTruthy()
  })

  it('renders only final mix block for direct dough', () => {
    render(<DoughResultBreakdown result={directResult} />)

    expect(screen.queryByRole('heading', { name: 'Preferment' })).toBeNull()
    expect(screen.getByText('Final mix')).toBeTruthy()
    expect(screen.getAllByText('1000.0g').length).toBeGreaterThan(1)
  })
})
