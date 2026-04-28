import './RecipeManager.scss'
import type { Dispatch, SetStateAction } from 'react'
import type {
  DoughCalculationRequest,
  DoughMetadata,
  FormState,
  PresetMetadata,
} from '../../types/dough'
import { RecipeComparisonView } from '../RecipeComparisonView'
import { RecipeDetailModal } from '../RecipeDetailModal'
import { RecipeListItem } from '../RecipeListItem'
import { RecipeCompareStatus } from './RecipeCompareStatus'
import { RecipeSaveRow } from './RecipeSaveRow'
import { useRecipeManager } from './useRecipeManager'

type RecipeManagerProps = {
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  formula: DoughCalculationRequest
  onLoadRecipe: (formula: DoughCalculationRequest) => void
}

export function RecipeManager({
  metadata,
  form,
  setForm,
  compatiblePresets,
  selectedPreset,
  formula,
  onLoadRecipe,
}: RecipeManagerProps) {
  const {
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
  } = useRecipeManager({ formula, onLoadRecipe })

  return (
    <section className="recipe-panel" aria-labelledby="recipes-title">
      <div className="recipe-header">
        <div>
          <p className="section-title">Recipes</p>
          <h2 id="recipes-title">Saved formulas</h2>
        </div>
        <span>{recipes.length}</span>
      </div>

      <RecipeSaveRow
        newRecipeName={newRecipeName}
        isLoading={isLoading}
        onChangeName={setNewRecipeName}
        onSave={saveNewRecipe}
      />

      {panelError && <p className="error-message">{panelError}</p>}

      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p className="empty-recipes">No saved recipes yet.</p>
        ) : (
          recipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isActive={recipe.id === activeRecipeId}
              isCompared={comparisonRecipeIds.includes(recipe.id)}
              isDisabled={isLoading}
              onSelect={openRecipe}
              onToggleCompare={toggleCompareRecipe}
              onDelete={(recipeId) => void removeRecipe(recipeId, 'panel')}
            />
          ))
        )}
      </div>

      <RecipeCompareStatus
        selectedCount={comparisonRecipeIds.length}
        isLoading={isLoading}
        onClear={clearComparisonSelection}
      />

      {comparison && (
        <RecipeComparisonView
          leftRecipe={comparison.leftRecipe}
          rightRecipe={comparison.rightRecipe}
          leftResult={comparison.leftResult}
          rightResult={comparison.rightResult}
          onClear={clearComparisonSelection}
        />
      )}

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
          formError={modalError}
          resultError={modalError}
          onChangeName={setModalRecipeName}
          onEdit={startEditingRecipe}
          onDuplicate={startDuplicateRecipe}
          onPreview={previewModalRecipe}
          onSave={saveModalRecipe}
          onDelete={() => void removeRecipe(preview.recipe.id, 'modal')}
          onCancelEdit={resetModal}
          onClose={resetModal}
        />
      )}
    </section>
  )
}
