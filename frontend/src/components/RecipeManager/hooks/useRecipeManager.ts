import type { DoughCalculationRequest } from '../../../types/dough'
import type { ErrorTarget } from '../lib/recipeManagerTypes'
import { useRecipeComparison } from './useRecipeComparison'
import { useRecipeCrud } from './useRecipeCrud'
import { useRecipeModalState } from './useRecipeModalState'

type UseRecipeManagerArgs = {
  formula: DoughCalculationRequest
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

export function useRecipeManager({ formula, onLoadRecipe }: UseRecipeManagerArgs) {
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

  const {
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
  } = useRecipeModalState({
    formula,
    recipes,
    setIsLoading,
    setPanelError,
    persistModalRecipe,
    onLoadRecipe,
  })

  const removeRecipe = async (id: string, errorTarget: ErrorTarget = 'panel') => {
    await deleteSavedRecipe({
      id,
      errorTarget,
      setModalError,
      onDeleted: () => closeDeletedRecipe(id),
    })
  }

  return {
    list: {
      recipes,
      activeRecipeId,
      openRecipe,
      removeRecipe,
    },
    save: {
      newRecipeName,
      setNewRecipeName,
      saveNewRecipe,
    },
    comparison: {
      data: comparison,
      recipeIds: comparisonRecipeIds,
      toggleRecipe: toggleCompareRecipe,
      clearSelection: clearComparisonSelection,
    },
    modal: {
      preview,
      mode: modalMode,
      recipe: modalRecipe,
      recipeName: modalRecipeName,
      sourceRecipeName,
      error: modalError,
      setRecipeName: setModalRecipeName,
      startEditing: startEditingRecipe,
      startDuplicating: startDuplicateRecipe,
      save: saveModalRecipe,
      previewRecipe: previewModalRecipe,
      reset: resetModal,
    },
    status: {
      isLoading,
      panelError,
    },
  }
}
