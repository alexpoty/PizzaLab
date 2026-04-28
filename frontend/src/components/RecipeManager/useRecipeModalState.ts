import { useMemo, useRef, useState } from 'react'
import { calculateDough } from '../../api/doughApi'
import type { DoughCalculationRequest } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import type { ErrorTarget, ModalMode, RecipePreview } from './recipeManagerTypes'
import {
  buildDuplicateRecipeName,
  buildModalRecipe,
  getErrorMessage,
} from './recipeManagerUtils'

type PersistModalRecipeArgs = {
  mode: ModalMode
  recipeId: string
  recipeName: string
  formula: DoughCalculationRequest
  onSaved: (recipe: Recipe) => Promise<unknown>
  setModalError: (message: string | null) => void
}

type UseRecipeModalStateArgs = {
  formula: DoughCalculationRequest
  recipes: Recipe[]
  setIsLoading: (isLoading: boolean) => void
  setPanelError: (message: string | null) => void
  persistModalRecipe: (args: PersistModalRecipeArgs) => Promise<void>
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

export function useRecipeModalState({
  formula,
  recipes,
  setIsLoading,
  setPanelError,
  persistModalRecipe,
  onLoadRecipe,
}: UseRecipeModalStateArgs) {
  const activeRequestIdRef = useRef(0)
  const [loadedRecipe, setLoadedRecipe] = useState<Recipe | null>(null)
  const [preview, setPreview] = useState<RecipePreview | null>(null)
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [modalRecipeName, setModalRecipeName] = useState('')
  const [sourceRecipeName, setSourceRecipeName] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  const modalRecipe = useMemo(() => {
    if (!preview) {
      return null
    }

    return buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula)
  }, [formula, modalMode, modalRecipeName, preview])

  const openRecipe = async (recipe: Recipe, errorTarget: ErrorTarget = 'modal') => {
    setPanelError(null)
    setModalError(null)
    setLoadedRecipe(recipe)
    setActiveRecipeId(recipe.id)
    setModalMode('view')
    setSourceRecipeName(null)
    setModalRecipeName(recipe.name)
    onLoadRecipe(recipe.formula)
    return showRecipe(recipe, errorTarget)
  }

  const startEditingRecipe = () => {
    if (!loadedRecipe) {
      return
    }

    setModalError(null)
    setModalMode('edit')
    setModalRecipeName(loadedRecipe.name)
    setSourceRecipeName(null)
    setActiveRecipeId(loadedRecipe.id)
    onLoadRecipe(loadedRecipe.formula)
  }

  const startDuplicateRecipe = () => {
    if (!loadedRecipe) {
      return
    }

    setModalError(null)
    setModalMode('duplicate')
    setSourceRecipeName(loadedRecipe.name)
    setModalRecipeName(buildDuplicateRecipeName(loadedRecipe.name, recipes))
    onLoadRecipe(loadedRecipe.formula)
  }

  const saveModalRecipe = async () => {
    if (!preview) {
      return
    }

    await persistModalRecipe({
      mode: modalMode,
      recipeId: preview.recipe.id,
      recipeName: modalRecipeName,
      formula,
      setModalError,
      onSaved: async (savedRecipe) => openRecipe(savedRecipe, 'modal'),
    })
  }

  const previewModalRecipe = async () => {
    if (!preview) {
      return
    }

    const requestId = startRequest()
    setIsLoading(true)
    setModalError(null)

    try {
      const result = await calculateDough(formula)
      if (!isLatestRequest(requestId)) {
        return
      }

      setPreview({
        recipe: buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula),
        result,
      })
    } catch (caught) {
      if (!isLatestRequest(requestId)) {
        return
      }

      setPreview({
        recipe: buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula),
        result: null,
      })
      setModalError(getErrorMessage(caught, 'Recipe calculation failed'))
    } finally {
      if (isLatestRequest(requestId)) {
        setIsLoading(false)
      }
    }
  }

  const resetModal = () => {
    invalidateRequests()

    if (modalMode !== 'view' && loadedRecipe) {
      onLoadRecipe(loadedRecipe.formula)
    }

    setPreview(null)
    setModalMode('view')
    setModalRecipeName('')
    setSourceRecipeName(null)
    setModalError(null)
  }

  const closeDeletedRecipe = (recipeId: string) => {
    setPreview((currentPreview) => (currentPreview?.recipe.id === recipeId ? null : currentPreview))

    if (activeRecipeId === recipeId) {
      setActiveRecipeId(null)
      setLoadedRecipe(null)
    }

    if (preview?.recipe.id === recipeId) {
      resetModal()
    }
  }

  return {
    preview,
    modalMode,
    modalRecipe,
    modalRecipeName,
    sourceRecipeName,
    activeRecipeId,
    modalError,
    setModalRecipeName,
    setModalError,
    openRecipe,
    startEditingRecipe,
    startDuplicateRecipe,
    saveModalRecipe,
    previewModalRecipe,
    resetModal,
    closeDeletedRecipe,
  }

  async function showRecipe(recipe: Recipe, errorTarget: ErrorTarget) {
    const requestId = startRequest()
    setIsLoading(true)
    clearError(errorTarget)

    try {
      const result = await calculateDough(recipe.formula)
      if (!isLatestRequest(requestId)) {
        return false
      }

      setPreview({ recipe, result })
      return true
    } catch (caught) {
      if (!isLatestRequest(requestId)) {
        return false
      }

      setPreview({ recipe, result: null })
      setErrorMessage(errorTarget, getErrorMessage(caught, 'Recipe calculation failed'))
      return false
    } finally {
      if (isLatestRequest(requestId)) {
        setIsLoading(false)
      }
    }
  }

  function startRequest() {
    activeRequestIdRef.current += 1
    return activeRequestIdRef.current
  }

  function invalidateRequests() {
    activeRequestIdRef.current += 1
  }

  function isLatestRequest(requestId: number) {
    return activeRequestIdRef.current === requestId
  }

  function clearError(target: ErrorTarget) {
    if (target === 'modal') {
      setModalError(null)
      return
    }

    setPanelError(null)
  }

  function setErrorMessage(target: ErrorTarget, message: string) {
    if (target === 'modal') {
      setModalError(message)
      return
    }

    setPanelError(message)
  }
}
