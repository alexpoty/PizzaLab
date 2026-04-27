// @vitest-environment jsdom

import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RecipeManager } from './RecipeManager'
import type { DoughCalculationRequest, DoughCalculationResponse } from '../types/dough'
import type { Recipe } from '../types/recipe'
import {
  createRecipe,
  deleteRecipe,
  fetchRecipes,
  updateRecipe,
} from '../api/recipeApi'
import { calculateDough } from '../api/doughApi'

vi.mock('../api/recipeApi', () => ({
  fetchRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}))

vi.mock('../api/doughApi', () => ({
  calculateDough: vi.fn(),
}))

const originalFormula: DoughCalculationRequest = {
  pizzaCount: 4,
  doughBallWeightGrams: 250,
  hydrationPercent: 65,
  saltPercent: 2.8,
  yeastType: 'INSTANT',
  doughMethod: 'DIRECT',
  fermentationPreset: 'ROOM_24H',
  roomTemperatureCelsius: 20,
}

const editedFormula: DoughCalculationRequest = {
  pizzaCount: 6,
  doughBallWeightGrams: 270,
  hydrationPercent: 68,
  saltPercent: 2.6,
  yeastType: 'FRESH',
  doughMethod: 'POOLISH',
  fermentationSchedule: {
    mode: 'MIXED',
    roomHours: 18,
    roomTemperatureCelsius: 21,
    coldHours: 24,
    coldTemperatureCelsius: 4,
  },
  prefermentFlourPercent: 35,
}

const calculationResult: DoughCalculationResponse = {
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

describe('RecipeManager', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('supports load, edit, and duplicate flows without breaking calculation', async () => {
    const initialRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Original dough',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const updatedRecipe: Recipe = {
      ...initialRecipe,
      name: 'Original dough v2',
      formula: editedFormula,
    }
    const duplicatedRecipe: Recipe = {
      id: 'recipe-2',
      name: 'Original dough v2 copy',
      formula: editedFormula,
      createdAt: '2026-04-27T00:05:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([initialRecipe])
    vi.mocked(updateRecipe).mockResolvedValue(updatedRecipe)
    vi.mocked(createRecipe).mockResolvedValue(duplicatedRecipe)
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    render(<RecipeManagerHarness />)

    expect(await screen.findByText('Original dough')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(screen.getByTestId('current-formula').textContent).toBe(JSON.stringify(originalFormula))
    })
    expect(calculateDough).toHaveBeenCalledWith(originalFormula)

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply variant formula' }))
    await userEvent.clear(screen.getByPlaceholderText('24h room direct'))
    await userEvent.type(screen.getByPlaceholderText('24h room direct'), 'Original dough v2')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(updateRecipe).toHaveBeenCalledWith('recipe-1', {
      name: 'Original dough v2',
      formula: editedFormula,
    })
    expect((await screen.findAllByText('Original dough v2')).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getByTestId('current-formula').textContent).toBe(JSON.stringify(editedFormula))
    })

    const duplicateButtons = screen.getAllByRole('button', { name: 'Duplicate' })
    await userEvent.click(duplicateButtons[0])

    expect(createRecipe).toHaveBeenCalledWith({
      name: 'Original dough v2 copy',
      formula: editedFormula,
    })
    expect((await screen.findAllByText('Original dough v2 copy')).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getByTestId('current-formula').textContent).toBe(JSON.stringify(editedFormula))
    })
    expect(calculateDough).toHaveBeenNthCalledWith(1, originalFormula)
    expect(calculateDough).toHaveBeenNthCalledWith(2, editedFormula)
    expect(calculateDough).toHaveBeenNthCalledWith(3, editedFormula)
  })
})

function RecipeManagerHarness() {
  const [formula, setFormula] = useState<DoughCalculationRequest>({
    pizzaCount: 2,
    doughBallWeightGrams: 230,
    hydrationPercent: 62,
    saltPercent: 2.9,
    yeastType: 'ACTIVE_DRY',
    doughMethod: 'DIRECT',
    fermentationPreset: 'COLD_24H',
    coldTemperatureCelsius: 4,
  })

  return (
    <>
      <button type="button" onClick={() => setFormula(editedFormula)}>
        Apply variant formula
      </button>
      <output data-testid="current-formula">{JSON.stringify(formula)}</output>
      <RecipeManager formula={formula} onLoadRecipe={setFormula} />
    </>
  )
}
