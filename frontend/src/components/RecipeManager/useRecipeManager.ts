import type { DoughCalculationRequest } from '../../types/dough'
import type { ErrorTarget } from './recipeManagerTypes'
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
}
