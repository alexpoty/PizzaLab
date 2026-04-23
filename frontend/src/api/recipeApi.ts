import type { CreateRecipeRequest, Recipe } from '../types/recipe'

export async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/recipes')

  if (!response.ok) {
    throw new Error('Recipes request failed')
  }

  return response.json()
}

export async function createRecipe(request: CreateRecipeRequest): Promise<Recipe> {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? 'Recipe save failed')
  }

  return data
}

export async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Recipe delete failed')
  }
}
