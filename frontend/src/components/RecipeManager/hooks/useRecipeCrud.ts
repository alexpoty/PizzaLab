import { useEffect, useRef, useState } from 'react'
import { createRecipe, deleteRecipe, fetchRecipes, updateRecipe } from '../../../api/recipeApi'
import type { DoughCalculationRequest } from '../../../types/dough'
import type { Recipe } from '../../../types/recipe'
import type { ErrorTarget, ModalMode } from '../lib/recipeManagerTypes'
import { getErrorMessage } from '../lib/recipeManagerUtils'
import {
  createRecipeBootstrapState,
  markRecipeDeleted,
  markRecipeUpsert,
  mergeBootstrapRecipes,
  prependRecipe,
  removeRecipeById,
  replaceRecipe,
} from '../lib/recipeCrudState'

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
  const bootstrapStateRef = useRef(createRecipeBootstrapState())
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [newRecipeName, setNewRecipeName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [panelError, setPanelError] = useState<string | null>(null)

  const setErrorMessage = (
    target: ErrorTarget,
    message: string | null,
    setModalError?: (message: string | null) => void,
  ) => {
    if (target === 'panel') {
      setPanelError(message)
      return
    }

    setModalError?.(message)
  }
  useEffect(() => {
    let isMounted = true

    fetchRecipes()
      .then((data) => {
        if (!isMounted) {
          return
        }

        if (bootstrapStateRef.current.canApplyBootstrap) {
          setRecipes(data)
          return
        }

        setRecipes((currentRecipes) =>
          mergeBootstrapRecipes(currentRecipes, data, bootstrapStateRef.current.deletedRecipeIds),
        )
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

    try {
      const savedRecipe = await createRecipe({ name, formula })
      markRecipeUpsert(bootstrapStateRef.current, savedRecipe.id)
      setRecipes((currentRecipes) => prependRecipe(currentRecipes, savedRecipe))
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

    try {
      const savedRecipe =
        mode === 'duplicate'
          ? await createRecipe({ name, formula })
          : await updateRecipe(recipeId, { name, formula })

      markRecipeUpsert(bootstrapStateRef.current, savedRecipe.id)
      setRecipes((currentRecipes) =>
        mode === 'duplicate' ? prependRecipe(currentRecipes, savedRecipe) : replaceRecipe(currentRecipes, savedRecipe),
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
    setErrorMessage(errorTarget, null, setModalError)

    try {
      await deleteRecipe(id)
      markRecipeDeleted(bootstrapStateRef.current, id)
      setRecipes((currentRecipes) => removeRecipeById(currentRecipes, id))
      onDeleted()
    } catch (caught) {
      setErrorMessage(errorTarget, getErrorMessage(caught, 'Recipe delete failed'), setModalError)
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
