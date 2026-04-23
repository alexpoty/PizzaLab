import { useEffect, useState } from 'react'
import { createRecipe, deleteRecipe, fetchRecipes } from '../api/recipeApi'
import type { DoughCalculationRequest } from '../types/dough'
import type { Recipe } from '../types/recipe'

type RecipeManagerProps = {
  formula: DoughCalculationRequest
}

export function RecipeManager({ formula }: RecipeManagerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipeName, setRecipeName] = useState('')
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

  const saveRecipe = async () => {
    const name = recipeName.trim()

    if (!name) {
      setError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const savedRecipe = await createRecipe({ name, formula })
      setRecipes((currentRecipes) => [savedRecipe, ...currentRecipes])
      setRecipeName('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe save failed')
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe delete failed')
    } finally {
      setIsLoading(false)
    }
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
          Save
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p className="empty-recipes">No saved recipes yet.</p>
        ) : (
          recipes.map((recipe) => (
            <article className="recipe-item" key={recipe.id}>
              <div>
                <h3>{recipe.name}</h3>
                <p>
                  {recipe.formula.doughMethod.toLowerCase()} · {recipe.formula.hydrationPercent}%
                  hydration · {recipe.formula.saltPercent}% salt
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeRecipe(recipe.id)}
                disabled={isLoading}
                aria-label={`Delete ${recipe.name}`}
              >
                Delete
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
