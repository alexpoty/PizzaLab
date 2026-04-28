// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RecipeComparisonView } from './RecipeComparisonView'
import type { DoughCalculationResponse } from '../../types/dough'
import type { Recipe } from '../../types/recipe'

const leftRecipe: Recipe = {
  id: 'recipe-1',
  name: 'Direct dough',
  createdAt: '2026-04-27T00:00:00Z',
  formula: {
    pizzaCount: 4,
    doughBallWeightGrams: 250,
    hydrationPercent: 65,
    saltPercent: 2.8,
    yeastType: 'INSTANT',
    doughMethod: 'DIRECT',
    fermentationPreset: 'ROOM_24H',
    roomTemperatureCelsius: 20,
  },
}

const rightRecipe: Recipe = {
  id: 'recipe-2',
  name: 'Poolish dough',
  createdAt: '2026-04-27T00:05:00Z',
  formula: {
    pizzaCount: 4,
    doughBallWeightGrams: 250,
    hydrationPercent: 68,
    saltPercent: 2.8,
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    fermentationPreset: 'ROOM_24H',
    roomTemperatureCelsius: 20,
    prefermentFlourPercent: 30,
  },
}

const leftResult: DoughCalculationResponse = {
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

const rightResult: DoughCalculationResponse = {
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

describe('RecipeComparisonView', () => {
  it('renders ingredient deltas and clears comparison on button click', async () => {
    const onClear = vi.fn()

    render(
      <RecipeComparisonView
        leftRecipe={leftRecipe}
        rightRecipe={rightRecipe}
        leftResult={leftResult}
        rightResult={rightResult}
        onClear={onClear}
      />,
    )

    expect(screen.getByText('Recipe delta view')).toBeTruthy()
    expect(screen.getAllByText('Direct dough').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Poolish dough').length).toBeGreaterThan(0)
    expect(screen.getByText('-80.0g')).toBeTruthy()
    expect(screen.getByText('+0.9g')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
