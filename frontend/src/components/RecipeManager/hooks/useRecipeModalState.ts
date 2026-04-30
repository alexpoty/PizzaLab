import { useMemo, useState } from 'react'
import { calculateDough } from '../../../api/doughApi'
import type { DoughCalculationRequest, DoughCalculationResponse } from '../../../types/dough'
import type { Recipe } from '../../../types/recipe'
import type { ErrorTarget, ModalMode, RecipePreview } from '../lib/recipeManagerTypes'
import {
  buildDuplicateRecipeName,
  buildModalRecipe,
  getErrorMessage,
} from '../lib/recipeManagerUtils'
import { useLatestRequestGate } from './useLatestRequestGate'

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
  const requestGate = useLatestRequestGate()
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
    clearError('panel')
    clearError('modal')
    setLoadedRecipe(recipe)
    setActiveRecipeId(recipe.id)
    setModalMode('view')
    setSourceRecipeName(null)
    setModalRecipeName(recipe.name)
    onLoadRecipe(recipe.formula)

    return runCalculation({
      recipe,
      calculationFormula: recipe.formula,
      errorTarget,
      buildNextRecipe: () => recipe,
    })
  }

  const startEditingRecipe = () => {
    if (!loadedRecipe) {
      return
    }

    clearError('modal')
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

    clearError('modal')
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

    await runCalculation({
      recipe: preview.recipe,
      calculationFormula: formula,
      errorTarget: 'modal',
      buildNextRecipe: (recipe) => buildPreviewRecipe(recipe),
    })
  }

  const resetModal = () => {
    requestGate.invalidateRequests()

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

  async function runCalculation({
    recipe,
    calculationFormula,
    errorTarget,
    buildNextRecipe,
  }: {
    recipe: Recipe
    calculationFormula: DoughCalculationRequest
    errorTarget: ErrorTarget
    buildNextRecipe: (recipe: Recipe) => Recipe
  }) {
    const requestId = requestGate.startRequest()
    setIsLoading(true)
    clearError(errorTarget)

    try {
      const result = await calculateDough(calculationFormula)
      return applyCalculationSuccess(requestId, buildNextRecipe(recipe), result)
    } catch (caught) {
      return applyCalculationFailure(
        requestId,
        buildNextRecipe(recipe),
        errorTarget,
        getErrorMessage(caught, 'Recipe calculation failed'),
      )
    } finally {
      if (requestGate.isLatestRequest(requestId)) {
        setIsLoading(false)
      }
    }
  }

  function applyCalculationSuccess(
    requestId: number,
    recipe: Recipe,
    result: DoughCalculationResponse,
  ) {
    if (!requestGate.isLatestRequest(requestId)) {
      return false
    }

    setPreview({ recipe, result })
    return true
  }

  function applyCalculationFailure(
    requestId: number,
    recipe: Recipe,
    errorTarget: ErrorTarget,
    message: string,
  ) {
    if (!requestGate.isLatestRequest(requestId)) {
      return false
    }

    setPreview({ recipe, result: null })
    setErrorMessage(errorTarget, message)
    return false
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

  function buildPreviewRecipe(recipe: Recipe) {
    return buildModalRecipe(recipe, modalMode, modalRecipeName, formula)
  }
}
