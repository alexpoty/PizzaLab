import { useEffect, useState } from 'react'
import { calculateDough } from '../api/doughApi'
import { createRecipe, deleteRecipe, fetchRecipes, updateRecipe } from '../api/recipeApi'
import type { DoughCalculationRequest, DoughCalculationResponse } from '../types/dough'
import type { Recipe } from '../types/recipe'
import { RecipeDetailModal } from './RecipeDetailModal'
import { RecipeListItem } from './RecipeListItem'

type RecipeManagerProps = {
  formula: DoughCalculationRequest
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

type RecipePreview = {
  recipe: Recipe
  result: DoughCalculationResponse
}

export function RecipeManager({ formula, onLoadRecipe }: RecipeManagerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [preview, setPreview] = useState<RecipePreview | null>(null)
  const [recipeName, setRecipeName] = useState('')
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchRecipes()
      .then((data) => {
        if (isMounted) {
          setRecipes(data)
        }
      })
      .catch((caught) => {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : 'Recipes request failed')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Recipes persist the formula input. Ingredient details are calculated on demand
  // so the modal always uses the same calculator logic as the main results panel.
  const saveRecipe = async () => {
    const name = recipeName.trim()

    if (!name) {
      setError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const savedRecipe = activeRecipeId
        ? await updateRecipe(activeRecipeId, { name, formula })
        : await createRecipe({ name, formula })

      setRecipes((currentRecipes) =>
        activeRecipeId
          ? currentRecipes.map((recipe) => (recipe.id === savedRecipe.id ? savedRecipe : recipe))
          : [savedRecipe, ...currentRecipes],
      )
      setActiveRecipeId(savedRecipe.id)
      setRecipeName(savedRecipe.name)
      await loadRecipe(savedRecipe)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : activeRecipeId
            ? 'Recipe update failed'
            : 'Recipe save failed',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const removeRecipe = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await deleteRecipe(id)
      setRecipes((currentRecipes) => currentRecipes.filter((recipe) => recipe.id !== id))
      setPreview((currentPreview) => (currentPreview?.recipe.id === id ? null : currentPreview))
      if (activeRecipeId === id) {
        setActiveRecipeId(null)
        setRecipeName('')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe delete failed')
    } finally {
      setIsLoading(false)
    }
  }

  const showRecipe = async (recipe: Recipe) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await calculateDough(recipe.formula)
      setPreview({ recipe, result })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe calculation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const openRecipe = async (recipe: Recipe) => {
    setActiveRecipeId(recipe.id)
    setRecipeName(recipe.name)
    onLoadRecipe(recipe.formula)
    await showRecipe(recipe)
  }

  const loadRecipe = async (recipe: Recipe) => {
    await openRecipe(recipe)
  }

  const editRecipe = (recipe: Recipe) => {
    setError(null)
    setActiveRecipeId(recipe.id)
    setRecipeName(recipe.name)
    onLoadRecipe(recipe.formula)
  }

  const duplicateRecipe = async (recipe: Recipe) => {
    const duplicateName = buildDuplicateRecipeName(recipe.name, recipes)

    setIsLoading(true)
    setError(null)

    try {
      const duplicatedRecipe = await createRecipe({
        name: duplicateName,
        formula: recipe.formula,
      })
      setRecipes((currentRecipes) => [duplicatedRecipe, ...currentRecipes])
      setActiveRecipeId(duplicatedRecipe.id)
      setRecipeName(duplicatedRecipe.name)
      onLoadRecipe(duplicatedRecipe.formula)
      await showRecipe(duplicatedRecipe)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe duplicate failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetEditing = () => {
    setActiveRecipeId(null)
    setRecipeName('')
    setError(null)
  }

  return (
    <section className="recipe-panel" aria-labelledby="recipes-title">
      <div className="recipe-header">
        <div>
          <p className="section-title">Recipes</p>
          <h2 id="recipes-title">Saved formulas</h2>
        </div>
        <span>{recipes.length}</span>
      </div>

      <div className="recipe-save-row">
        <label>
          <span>Name</span>
          <input
            value={recipeName}
            onChange={(event) => setRecipeName(event.target.value)}
            placeholder="24h room direct"
          />
        </label>
        <button type="button" onClick={saveRecipe} disabled={isLoading}>
          {activeRecipeId ? 'Update' : 'Save'}
        </button>
        {activeRecipeId && (
          <button type="button" onClick={resetEditing} disabled={isLoading}>
            Cancel
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p className="empty-recipes">No saved recipes yet.</p>
        ) : (
          recipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isDisabled={isLoading}
              onLoad={loadRecipe}
              onEdit={editRecipe}
              onDuplicate={duplicateRecipe}
              onDelete={removeRecipe}
            />
          ))
        )}
      </div>

      {preview && (
        <RecipeDetailModal
          recipe={preview.recipe}
          result={preview.result}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  )
}

function buildDuplicateRecipeName(name: string, recipes: Recipe[]) {
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
