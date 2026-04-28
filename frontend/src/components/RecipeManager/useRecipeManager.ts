import { useMemo, useState } from 'react'
import { calculateDough } from '../../api/doughApi'
import type { DoughCalculationRequest } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import type { ErrorTarget, ModalMode, RecipePreview } from './recipeManagerTypes'
import {
  buildDuplicateRecipeName,
  buildModalRecipe,
  getErrorMessage,
} from './recipeManagerUtils'
import { useRecipeComparison } from './useRecipeComparison'
import { useRecipeCrud } from './useRecipeCrud'

type UseRecipeManagerArgs = {
  formula: DoughCalculationRequest
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

export function useRecipeManager({ formula, onLoadRecipe }: UseRecipeManagerArgs) {
  const [loadedRecipe, setLoadedRecipe] = useState<Recipe | null>(null)
  const [preview, setPreview] = useState<RecipePreview | null>(null)
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [modalRecipeName, setModalRecipeName] = useState('')
  const [sourceRecipeName, setSourceRecipeName] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const {
    recipes,
    newRecipeName,
    isLoading,
    panelError,
    setIsLoading,
    setPanelError,
    setNewRecipeName,
    saveNewRecipe,
    saveModalRecipe: persistModalRecipe,
    removeRecipe: deleteSavedRecipe,
  } = useRecipeCrud({
    formula,
    onSavedRecipe: async (savedRecipe) => openRecipe(savedRecipe),
  })

  const { comparison, comparisonRecipeIds, toggleCompareRecipe, clearComparisonSelection } =
    useRecipeComparison({
      recipes,
      setIsLoading,
      setPanelError,
    })

  const modalRecipe = useMemo(() => {
    if (!preview) {
      return null
    }

    return buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula)
  }, [formula, modalMode, modalRecipeName, preview])

  const removeRecipe = async (id: string, errorTarget: ErrorTarget = 'panel') => {
    await deleteSavedRecipe({
      id,
      errorTarget,
      setModalError,
      onDeleted: () => {
        setPreview((currentPreview) => (currentPreview?.recipe.id === id ? null : currentPreview))

        if (activeRecipeId === id) {
          setActiveRecipeId(null)
          setLoadedRecipe(null)
        }

        if (preview?.recipe.id === id) {
          resetModal()
        }
      },
    })
  }

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

    setIsLoading(true)
    setModalError(null)

    try {
      const result = await calculateDough(formula)
      setPreview({
        recipe: buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula),
        result,
      })
    } catch (caught) {
      setPreview({
        recipe: buildModalRecipe(preview.recipe, modalMode, modalRecipeName, formula),
        result: null,
      })
      setModalError(getErrorMessage(caught, 'Recipe calculation failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    if (modalMode !== 'view' && loadedRecipe) {
      onLoadRecipe(loadedRecipe.formula)
    }

    setPreview(null)
    setModalMode('view')
    setModalRecipeName('')
    setSourceRecipeName(null)
    setModalError(null)
  }

  return {
    recipes,
    preview,
    comparison,
    modalMode,
    modalRecipe,
    modalRecipeName,
    sourceRecipeName,
    newRecipeName,
    activeRecipeId,
    comparisonRecipeIds,
    isLoading,
    panelError,
    modalError,
    setNewRecipeName,
    setModalRecipeName,
    saveNewRecipe,
    removeRecipe,
    openRecipe,
    startEditingRecipe,
    startDuplicateRecipe,
    saveModalRecipe,
    previewModalRecipe,
    toggleCompareRecipe,
    clearComparisonSelection,
    resetModal,
  }

  async function showRecipe(recipe: Recipe, errorTarget: ErrorTarget) {
    setIsLoading(true)
    clearError(errorTarget)

    try {
      const result = await calculateDough(recipe.formula)
      setPreview({ recipe, result })
      return true
    } catch (caught) {
      setPreview({ recipe, result: null })
      setErrorMessage(errorTarget, getErrorMessage(caught, 'Recipe calculation failed'))
      return false
    } finally {
      setIsLoading(false)
    }
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
