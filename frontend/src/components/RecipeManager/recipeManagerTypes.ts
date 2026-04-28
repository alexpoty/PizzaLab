import type { DoughCalculationResponse } from '../../types/dough'
import type { Recipe } from '../../types/recipe'

export type ModalMode = 'view' | 'edit' | 'duplicate'

export type ErrorTarget = 'panel' | 'modal'

export type RecipePreview = {
  recipe: Recipe
  result: DoughCalculationResponse | null
}

export type RecipeComparison = {
  leftRecipe: Recipe
  rightRecipe: Recipe
  leftResult: DoughCalculationResponse
  rightResult: DoughCalculationResponse
}
