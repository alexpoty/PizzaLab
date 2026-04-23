import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRecipe, deleteRecipe, fetchRecipes } from './recipeApi'
import type { CreateRecipeRequest } from '../types/recipe'

const recipeRequest: CreateRecipeRequest = {
  name: '24h direct dough',
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

describe('recipeApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches saved recipes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'recipe-id', ...recipeRequest, createdAt: '2026-04-23T00:00:00Z' }],
    } as Response)

    await expect(fetchRecipes()).resolves.toHaveLength(1)
    expect(fetch).toHaveBeenCalledWith('/api/recipes')
  })

  it('creates a recipe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'recipe-id', ...recipeRequest, createdAt: '2026-04-23T00:00:00Z' }),
    } as Response)

    await expect(createRecipe(recipeRequest)).resolves.toMatchObject({
      id: 'recipe-id',
      name: '24h direct dough',
    })
    expect(fetch).toHaveBeenCalledWith('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeRequest),
    })
  })

  it('deletes a recipe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
    } as Response)

    await expect(deleteRecipe('recipe-id')).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith('/api/recipes/recipe-id', {
      method: 'DELETE',
    })
  })
})
