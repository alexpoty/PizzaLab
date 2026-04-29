import type { Recipe } from '../../../types/recipe'

export function createRecipeBootstrapState() {
  return {
    canApplyBootstrap: true,
    deletedRecipeIds: new Set<string>(),
  }
}

export function lockBootstrap(state: ReturnType<typeof createRecipeBootstrapState>) {
  state.canApplyBootstrap = false
}

export function markRecipeUpsert(
  state: ReturnType<typeof createRecipeBootstrapState>,
  recipeId: string,
) {
  lockBootstrap(state)
  state.deletedRecipeIds.delete(recipeId)
}

export function markRecipeDeleted(
  state: ReturnType<typeof createRecipeBootstrapState>,
  recipeId: string,
) {
  lockBootstrap(state)
  state.deletedRecipeIds.add(recipeId)
}

export function mergeBootstrapRecipes(
  currentRecipes: Recipe[],
  bootstrapRecipes: Recipe[],
  deletedRecipeIds: Set<string>,
) {
  const currentRecipeIds = new Set(currentRecipes.map((recipe) => recipe.id))
  const mergedBootstrapRecipes = bootstrapRecipes.filter(
    (recipe) => !currentRecipeIds.has(recipe.id) && !deletedRecipeIds.has(recipe.id),
  )

  return [...currentRecipes, ...mergedBootstrapRecipes]
}

export function prependRecipe(currentRecipes: Recipe[], recipe: Recipe) {
  return [recipe, ...currentRecipes]
}

export function replaceRecipe(currentRecipes: Recipe[], recipe: Recipe) {
  return currentRecipes.map((currentRecipe) =>
    currentRecipe.id === recipe.id ? recipe : currentRecipe,
  )
}

export function removeRecipeById(currentRecipes: Recipe[], recipeId: string) {
  return currentRecipes.filter((recipe) => recipe.id !== recipeId)
}
