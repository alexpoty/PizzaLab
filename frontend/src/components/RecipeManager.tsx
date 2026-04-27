import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { calculateDough } from '../api/doughApi'
import { createRecipe, deleteRecipe, fetchRecipes, updateRecipe } from '../api/recipeApi'
import type {
  DoughCalculationRequest,
  DoughCalculationResponse,
  DoughMetadata,
  FormState,
  PresetMetadata,
} from '../types/dough'
import type { Recipe } from '../types/recipe'
import { RecipeDetailModal } from './RecipeDetailModal'
import { RecipeListItem } from './RecipeListItem'

type RecipeManagerProps = {
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  calculationError: string | null
  formula: DoughCalculationRequest
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

type RecipePreview = {
  recipe: Recipe
  result: DoughCalculationResponse
}

type ModalMode = 'view' | 'edit' | 'duplicate'

export function RecipeManager({
  metadata,
  form,
  setForm,
  compatiblePresets,
  selectedPreset,
  calculationError,
  formula,
  onLoadRecipe,
}: RecipeManagerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [preview, setPreview] = useState<RecipePreview | null>(null)
  const [newRecipeName, setNewRecipeName] = useState('')
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [modalRecipeName, setModalRecipeName] = useState('')
  const [sourceRecipeName, setSourceRecipeName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // While the modal is in edit or duplicate mode, keep the preview card in sync
  // with the draft name and formula the user is currently adjusting.
  const modalRecipe = useMemo(() => {
    if (!preview) {
      return null
    }

    return buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula)
  }, [formula, modalMode, modalRecipeName, preview])

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
  const saveNewRecipe = async () => {
    const name = newRecipeName.trim()

    if (!name) {
      setError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const savedRecipe = await createRecipe({ name, formula })
      setRecipes((currentRecipes) => [savedRecipe, ...currentRecipes])
      setNewRecipeName('')
      await openRecipe(savedRecipe)
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
      setPreview((currentPreview) => (currentPreview?.recipe.id === id ? null : currentPreview))
      if (activeRecipeId === id) {
        setActiveRecipeId(null)
      }
      if (preview?.recipe.id === id) {
        resetModal()
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
    setError(null)
    setActiveRecipeId(recipe.id)
    setModalMode('view')
    setSourceRecipeName(null)
    setModalRecipeName(recipe.name)
    onLoadRecipe(recipe.formula)
    await showRecipe(recipe)
  }

  const startEditingRecipe = () => {
    if (!preview) {
      return
    }

    setError(null)
    setModalMode('edit')
    setModalRecipeName(preview.recipe.name)
    setSourceRecipeName(null)
    setActiveRecipeId(preview.recipe.id)
    onLoadRecipe(preview.recipe.formula)
  }

  const startDuplicateRecipe = () => {
    if (!preview) {
      return
    }

    const recipe = preview.recipe
    const duplicateName = buildDuplicateRecipeName(recipe.name, recipes)

    setError(null)
    setModalMode('duplicate')
    setSourceRecipeName(recipe.name)
    setModalRecipeName(duplicateName)
    onLoadRecipe(recipe.formula)
  }

  const saveModalRecipe = async () => {
    if (!preview) {
      return
    }

    const name = modalRecipeName.trim()

    if (!name) {
      setError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const savedRecipe =
        modalMode === 'duplicate'
          ? await createRecipe({ name, formula })
          : await updateRecipe(preview.recipe.id, { name, formula })

      setRecipes((currentRecipes) =>
        modalMode === 'duplicate'
          ? [savedRecipe, ...currentRecipes]
          : currentRecipes.map((recipe) => (recipe.id === savedRecipe.id ? savedRecipe : recipe)),
      )
      await openRecipe(savedRecipe)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : modalMode === 'duplicate'
            ? 'Recipe duplicate failed'
            : 'Recipe update failed',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const previewModalRecipe = async () => {
    if (!preview) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await calculateDough(formula)
      setPreview({
        recipe: buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula),
        result,
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recipe calculation failed')
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
            value={newRecipeName}
            onChange={(event) => setNewRecipeName(event.target.value)}
            placeholder="24h room direct"
          />
        </label>
        <button type="button" onClick={saveNewRecipe} disabled={isLoading}>
          Save current
        </button>
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
              isActive={recipe.id === activeRecipeId}
              isDisabled={isLoading}
              onSelect={openRecipe}
            />
          ))
        )}
      </div>

      {preview && (
        <RecipeDetailModal
          recipe={modalRecipe ?? preview.recipe}
          result={preview.result}
          mode={modalMode}
          recipeName={modalRecipeName}
          sourceRecipeName={sourceRecipeName}
          isLoading={isLoading}
          metadata={metadata}
          form={form}
          setForm={setForm}
          compatiblePresets={compatiblePresets}
          selectedPreset={selectedPreset}
          formError={calculationError}
          onChangeName={setModalRecipeName}
          onEdit={startEditingRecipe}
          onDuplicate={startDuplicateRecipe}
          onPreview={previewModalRecipe}
          onSave={saveModalRecipe}
          onDelete={() => void removeRecipe(preview.recipe.id)}
          onCancelEdit={resetModal}
          onClose={resetModal}
        />
      )}
    </section>
  )

  function resetModal() {
    setPreview(null)
    setModalMode('view')
    setModalRecipeName('')
    setSourceRecipeName(null)
    setError(null)
  }
}

function buildModalRecipe(
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
