// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { calculateDough } from '../../api/doughApi'
import type { DoughCalculationRequest, DoughCalculationResponse } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { useRecipeModalState } from './useRecipeModalState'

vi.mock('../../api/doughApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/doughApi')>()

  return {
    ...actual,
    calculateDough: vi.fn(),
  }
})

const baseFormula: DoughCalculationRequest = {
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
  ...baseFormula,
  hydrationPercent: 68,
  doughMethod: 'POOLISH',
  prefermentFlourPercent: 30,
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

describe('useRecipeModalState', () => {
  it('handles open, edit, preview, duplicate, save, and reset modal flow', async () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Original dough',
      formula: baseFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const duplicatedRecipe: Recipe = {
      id: 'recipe-2',
      name: 'Original dough copy',
      formula: editedFormula,
      createdAt: '2026-04-27T00:05:00Z',
    }
    const recipes = [recipe]
    const setIsLoading = vi.fn()
    const setPanelError = vi.fn()
    const persistModalRecipe = vi.fn().mockResolvedValue(undefined)
    const onLoadRecipe = vi.fn()

    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    const { result, rerender } = renderHook(
      ({ formula }) =>
        useRecipeModalState({
          formula,
          recipes,
          setIsLoading,
          setPanelError,
          persistModalRecipe,
          onLoadRecipe,
        }),
      {
        initialProps: { formula: baseFormula },
      },
    )

    await act(async () => {
      await result.current.openRecipe(recipe)
    })

    expect(result.current.preview?.recipe).toEqual(recipe)
    expect(result.current.activeRecipeId).toBe('recipe-1')
    expect(result.current.modalMode).toBe('view')
    expect(result.current.modalRecipeName).toBe('Original dough')
    expect(onLoadRecipe).toHaveBeenCalledWith(baseFormula)
    expect(calculateDough).toHaveBeenCalledWith(baseFormula)

    act(() => {
      result.current.startEditingRecipe()
    })

    expect(result.current.modalMode).toBe('edit')
    expect(result.current.modalRecipeName).toBe('Original dough')

    act(() => {
      result.current.setModalRecipeName('Original dough v2')
    })

    rerender({ formula: editedFormula })

    await act(async () => {
      await result.current.previewModalRecipe()
    })

    await waitFor(() => {
      expect(result.current.preview?.recipe.name).toBe('Original dough v2')
    })
    expect(result.current.preview?.recipe.formula).toEqual(editedFormula)
    expect(calculateDough).toHaveBeenLastCalledWith(editedFormula)

    await act(async () => {
      await result.current.saveModalRecipe()
    })

    expect(persistModalRecipe).toHaveBeenCalledWith({
      mode: 'edit',
      recipeId: 'recipe-1',
      recipeName: 'Original dough v2',
      formula: editedFormula,
      setModalError: expect.any(Function),
      onSaved: expect.any(Function),
    })

    await act(async () => {
      await persistModalRecipe.mock.calls[0][0].onSaved(duplicatedRecipe)
    })

    expect(result.current.preview?.recipe).toEqual(duplicatedRecipe)
    expect(result.current.modalMode).toBe('view')
    expect(result.current.modalRecipeName).toBe('Original dough copy')

    act(() => {
      result.current.startDuplicateRecipe()
    })

    expect(result.current.modalMode).toBe('duplicate')
    expect(result.current.sourceRecipeName).toBe('Original dough copy')
    expect(result.current.modalRecipeName).toBe('Original dough copy copy')

    act(() => {
      result.current.resetModal()
    })

    expect(result.current.preview).toBeNull()
    expect(result.current.modalMode).toBe('view')
    expect(result.current.modalRecipeName).toBe('')
    expect(result.current.sourceRecipeName).toBeNull()
    expect(onLoadRecipe).toHaveBeenLastCalledWith(duplicatedRecipe.formula)
  })
})
