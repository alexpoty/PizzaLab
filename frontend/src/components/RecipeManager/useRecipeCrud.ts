import { useEffect, useRef, useState } from 'react'
import { createRecipe, deleteRecipe, fetchRecipes, updateRecipe } from '../../api/recipeApi'
import type { DoughCalculationRequest } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import type { ErrorTarget, ModalMode } from './recipeManagerTypes'
import { getErrorMessage } from './recipeManagerUtils'

type SaveModalRecipeArgs = {
  mode: ModalMode
  recipeId: string
  recipeName: string
  formula: DoughCalculationRequest
  onSaved: (recipe: Recipe) => Promise<unknown>
  setModalError: (message: string | null) => void
}

type RemoveRecipeArgs = {
  id: string
  errorTarget?: ErrorTarget
  onDeleted: () => void
  setModalError: (message: string | null) => void
}

type UseRecipeCrudArgs = {
  formula: DoughCalculationRequest
  onSavedRecipe: (recipe: Recipe) => Promise<unknown>
}

export function useRecipeCrud({ formula, onSavedRecipe }: UseRecipeCrudArgs) {
  const canApplyBootstrapRef = useRef(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [newRecipeName, setNewRecipeName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [panelError, setPanelError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchRecipes()
      .then((data) => {
        if (isMounted && canApplyBootstrapRef.current) {
          setRecipes(data)
        }
      })
      .catch((caught) => {
        if (isMounted) {
          setPanelError(getErrorMessage(caught, 'Recipes request failed'))
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const saveNewRecipe = async () => {
    const name = newRecipeName.trim()

    if (!name) {
      setPanelError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setPanelError(null)
    canApplyBootstrapRef.current = false

    try {
      const savedRecipe = await createRecipe({ name, formula })
      setRecipes((currentRecipes) => [savedRecipe, ...currentRecipes])
      setNewRecipeName('')
      await onSavedRecipe(savedRecipe)
    } catch (caught) {
      setPanelError(getErrorMessage(caught, 'Recipe save failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const saveModalRecipe = async ({
    mode,
    recipeId,
    recipeName,
    formula,
    onSaved,
    setModalError,
  }: SaveModalRecipeArgs) => {
    const name = recipeName.trim()

    if (!name) {
      setModalError('Recipe name is required')
      return
    }

    setIsLoading(true)
    setModalError(null)
    canApplyBootstrapRef.current = false

    try {
      const savedRecipe =
        mode === 'duplicate'
          ? await createRecipe({ name, formula })
          : await updateRecipe(recipeId, { name, formula })

      setRecipes((currentRecipes) =>
        mode === 'duplicate'
          ? [savedRecipe, ...currentRecipes]
          : currentRecipes.map((recipe) => (recipe.id === savedRecipe.id ? savedRecipe : recipe)),
      )
      await onSaved(savedRecipe)
    } catch (caught) {
      setModalError(
        getErrorMessage(
          caught,
          mode === 'duplicate' ? 'Recipe duplicate failed' : 'Recipe update failed',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const removeRecipe = async ({
    id,
    errorTarget = 'panel',
    onDeleted,
    setModalError,
  }: RemoveRecipeArgs) => {
    setIsLoading(true)
    canApplyBootstrapRef.current = false

    if (errorTarget === 'panel') {
      setPanelError(null)
    } else {
      setModalError(null)
    }

    try {
      await deleteRecipe(id)
      setRecipes((currentRecipes) => currentRecipes.filter((recipe) => recipe.id !== id))
      onDeleted()
    } catch (caught) {
      const message = getErrorMessage(caught, 'Recipe delete failed')

      if (errorTarget === 'panel') {
        setPanelError(message)
      } else {
        setModalError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    recipes,
    newRecipeName,
    isLoading,
    panelError,
    setRecipes,
    setIsLoading,
    setPanelError,
    setNewRecipeName,
    saveNewRecipe,
    saveModalRecipe,
    removeRecipe,
  }
}
