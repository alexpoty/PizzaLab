import type { DoughCalculationRequest } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import type { ModalMode } from './recipeManagerTypes'

export function buildModalRecipe(
  recipe: Recipe,
  mode: ModalMode,
  recipeName: string,
  formula: DoughCalculationRequest,
) {
  if (mode === 'view') {
    return recipe
  }

  return {
    ...recipe,
    name: recipeName.trim() || recipe.name,
    formula,
  }
}

export function buildDuplicateRecipeName(name: string, recipes: Recipe[]) {
  const trimmedName = name.trim()
  const existingNames = new Set(recipes.map((recipe) => recipe.name))
  const baseName = `${trimmedName} copy`

  if (!existingNames.has(baseName)) {
    return baseName
  }

  let copyIndex = 2
  let nextName = `${trimmedName} copy ${copyIndex}`

  while (existingNames.has(nextName)) {
    copyIndex += 1
    nextName = `${trimmedName} copy ${copyIndex}`
  }

  return nextName
}

export function getErrorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback
}
