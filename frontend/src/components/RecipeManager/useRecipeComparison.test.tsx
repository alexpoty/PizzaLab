// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { calculateDough } from '../../api/doughApi'
import type { DoughCalculationResponse } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { useRecipeComparison } from './useRecipeComparison'

vi.mock('../../api/doughApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/doughApi')>()

  return {
    ...actual,
    calculateDough: vi.fn(),
  }
})

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

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, resolve, reject }
}

describe('useRecipeComparison', () => {
  it('clears loading when a comparison request is canceled', async () => {
    const directRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Direct dough',
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
      createdAt: '2026-04-27T00:00:00Z',
    }
    const poolishRecipe: Recipe = {
      id: 'recipe-2',
      name: 'Poolish dough',
      formula: {
        ...directRecipe.formula,
        doughMethod: 'POOLISH',
        hydrationPercent: 68,
        prefermentFlourPercent: 30,
      },
      createdAt: '2026-04-27T00:05:00Z',
    }

    const firstRequest = createDeferred<DoughCalculationResponse>()
    const secondRequest = createDeferred<DoughCalculationResponse>()
    const setIsLoading = vi.fn()
    const setPanelError = vi.fn()

    vi.mocked(calculateDough)
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)

    const { result, unmount } = renderHook(() =>
      useRecipeComparison({
        recipes: [directRecipe, poolishRecipe],
        setIsLoading,
        setPanelError,
      }),
    )

    act(() => {
      result.current.toggleCompareRecipe(directRecipe)
      result.current.toggleCompareRecipe(poolishRecipe)
    })

    await waitFor(() => {
      expect(setIsLoading).toHaveBeenCalledWith(true)
    })

    act(() => {
      result.current.toggleCompareRecipe(poolishRecipe)
    })

    await waitFor(() => {
      expect(setIsLoading).toHaveBeenLastCalledWith(false)
    })

    await act(async () => {
      firstRequest.resolve(calculationResult)
      secondRequest.resolve(calculationResult)
      await Promise.all([firstRequest.promise, secondRequest.promise])
    })

    expect(result.current.comparisonRecipeIds).toEqual(['recipe-1'])
    expect(result.current.comparison).toBeNull()

    await act(async () => {
      unmount()
      await Promise.resolve()
    })
  })

  it('prunes deleted recipe ids before rotating compare selection', async () => {
    const recipeOne: Recipe = {
      id: 'recipe-1',
      name: 'Direct dough',
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
      createdAt: '2026-04-27T00:00:00Z',
    }
    const recipeTwo: Recipe = {
      id: 'recipe-2',
      name: 'Poolish dough',
      formula: {
        ...recipeOne.formula,
        doughMethod: 'POOLISH',
        hydrationPercent: 68,
        prefermentFlourPercent: 30,
      },
      createdAt: '2026-04-27T00:05:00Z',
    }
    const recipeThree: Recipe = {
      id: 'recipe-3',
      name: 'Biga dough',
      formula: {
        ...recipeOne.formula,
        doughMethod: 'BIGA',
        hydrationPercent: 62,
        prefermentFlourPercent: 40,
      },
      createdAt: '2026-04-27T00:10:00Z',
    }

    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    const { result, rerender, unmount } = renderHook(
      ({ recipes }) =>
        useRecipeComparison({
          recipes,
          setIsLoading: vi.fn(),
          setPanelError: vi.fn(),
        }),
      {
        initialProps: {
          recipes: [recipeOne, recipeTwo, recipeThree],
        },
      },
    )

    act(() => {
      result.current.toggleCompareRecipe(recipeOne)
      result.current.toggleCompareRecipe(recipeTwo)
    })

    await waitFor(() => {
      expect(result.current.comparisonRecipeIds).toEqual(['recipe-1', 'recipe-2'])
      expect(result.current.comparison).not.toBeNull()
    })

    rerender({
      recipes: [recipeTwo, recipeThree],
    })

    expect(result.current.comparisonRecipeIds).toEqual(['recipe-2'])

    act(() => {
      result.current.toggleCompareRecipe(recipeThree)
    })

    await waitFor(() => {
      expect(result.current.comparisonRecipeIds).toEqual(['recipe-2', 'recipe-3'])
      expect(result.current.comparison).not.toBeNull()
    })

    await act(async () => {
      unmount()
      await Promise.resolve()
    })
  })
})
