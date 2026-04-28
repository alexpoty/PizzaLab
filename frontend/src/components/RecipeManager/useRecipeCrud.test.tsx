// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createRecipe, fetchRecipes } from '../../api/recipeApi'
import type { DoughCalculationRequest } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { useRecipeCrud } from './useRecipeCrud'

vi.mock('../../api/recipeApi', () => ({
  fetchRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}))

const formula: DoughCalculationRequest = {
  pizzaCount: 4,
  doughBallWeightGrams: 250,
  hydrationPercent: 65,
  saltPercent: 2.8,
  yeastType: 'INSTANT',
  doughMethod: 'DIRECT',
  fermentationPreset: 'ROOM_24H',
  roomTemperatureCelsius: 20,
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

describe('useRecipeCrud', () => {
  it('merges bootstrap recipes with newer local recipe state', async () => {
    const existingRecipe: Recipe = {
      id: 'existing-recipe',
      name: 'Existing recipe',
      formula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const newRecipe: Recipe = {
      id: 'new-recipe',
      name: 'Fresh recipe',
      formula,
      createdAt: '2026-04-27T00:05:00Z',
    }
    const deferredFetch = createDeferred<Recipe[]>()
    const onSavedRecipe = vi.fn().mockResolvedValue(undefined)

    vi.mocked(fetchRecipes).mockReturnValueOnce(deferredFetch.promise)
    vi.mocked(createRecipe).mockResolvedValueOnce(newRecipe)

    const { result } = renderHook(() =>
      useRecipeCrud({
        formula,
        onSavedRecipe,
      }),
    )

    act(() => {
      result.current.setNewRecipeName('Fresh recipe')
    })

    await act(async () => {
      await result.current.saveNewRecipe()
    })

    expect(result.current.recipes).toEqual([newRecipe])
    expect(onSavedRecipe).toHaveBeenCalledWith(newRecipe)

    await act(async () => {
      deferredFetch.resolve([existingRecipe])
      await deferredFetch.promise
    })

    await waitFor(() => {
      expect(result.current.recipes).toEqual([newRecipe, existingRecipe])
    })
  })

  it('still applies the initial fetch when an early mutation fails', async () => {
    const fetchedRecipe: Recipe = {
      id: 'fetched-recipe',
      name: 'Fetched recipe',
      formula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const deferredFetch = createDeferred<Recipe[]>()

    vi.mocked(fetchRecipes).mockReturnValueOnce(deferredFetch.promise)
    vi.mocked(createRecipe).mockRejectedValueOnce(new Error('Recipe save failed'))

    const { result } = renderHook(() =>
      useRecipeCrud({
        formula,
        onSavedRecipe: vi.fn().mockResolvedValue(undefined),
      }),
    )

    act(() => {
      result.current.setNewRecipeName('Failed recipe')
    })

    await act(async () => {
      await result.current.saveNewRecipe()
    })

    expect(result.current.recipes).toEqual([])
    expect(result.current.panelError).toBe('Recipe save failed')

    await act(async () => {
      deferredFetch.resolve([fetchedRecipe])
      await deferredFetch.promise
    })

    await waitFor(() => {
      expect(result.current.recipes).toEqual([fetchedRecipe])
    })
  })
})
