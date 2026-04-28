import { useEffect, useMemo, useState } from 'react'
import { calculateDough } from '../../api/doughApi'
import type { Recipe } from '../../types/recipe'
import type { RecipeComparison } from './recipeManagerTypes'
import { getErrorMessage } from './recipeManagerUtils'

type UseRecipeComparisonArgs = {
  recipes: Recipe[]
  setIsLoading: (isLoading: boolean) => void
  setPanelError: (message: string | null) => void
}

export function useRecipeComparison({
  recipes,
  setIsLoading,
  setPanelError,
}: UseRecipeComparisonArgs) {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([])
  const [comparison, setComparison] = useState<RecipeComparison | null>(null)

  const comparisonRecipeIds = useMemo(
    () => selectedRecipeIds.filter((recipeId) => recipes.some((recipe) => recipe.id === recipeId)),
    [recipes, selectedRecipeIds],
  )

  useEffect(() => {
    if (comparisonRecipeIds.length < 2) {
      return
    }

    const selectedRecipes = comparisonRecipeIds
      .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId) ?? null)
      .filter((recipe): recipe is Recipe => recipe !== null)

    let isMounted = true
    setIsLoading(true)
    setPanelError(null)

    Promise.all([calculateDough(selectedRecipes[0].formula), calculateDough(selectedRecipes[1].formula)])
      .then(([leftResult, rightResult]) => {
        if (!isMounted) {
          return
        }

        setComparison({
          leftRecipe: selectedRecipes[0],
          rightRecipe: selectedRecipes[1],
          leftResult,
          rightResult,
        })
      })
      .catch((caught) => {
        if (!isMounted) {
          return
        }

        setComparison(null)
        setPanelError(getErrorMessage(caught, 'Recipe comparison failed'))
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      setIsLoading(false)
    }
  }, [comparisonRecipeIds, recipes, setIsLoading, setPanelError])

  const toggleCompareRecipe = (recipe: Recipe) => {
    setComparison(null)
    setPanelError(null)
    setSelectedRecipeIds((currentIds) => {
      const validIds = currentIds.filter((recipeId) =>
        recipes.some((existingRecipe) => existingRecipe.id === recipeId),
      )

      if (validIds.includes(recipe.id)) {
        return validIds.filter((recipeId) => recipeId !== recipe.id)
      }

      if (validIds.length === 2) {
        return [validIds[1], recipe.id]
      }

      return [...validIds, recipe.id]
    })
  }

  const clearComparisonSelection = () => {
    setSelectedRecipeIds([])
    setComparison(null)
    setPanelError(null)
  }

  return {
    comparison: comparisonRecipeIds.length === 2 ? comparison : null,
    comparisonRecipeIds,
    toggleCompareRecipe,
    clearComparisonSelection,
  }
}
