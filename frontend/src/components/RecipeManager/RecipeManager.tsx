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
import { RecipeCompareStatus } from './components/RecipeCompareStatus'
import { RecipeSaveRow } from './components/RecipeSaveRow'
import { useRecipeManager } from './hooks/useRecipeManager'

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
    list,
    save,
    comparison,
    modal,
    status,
  } = useRecipeManager({ formula, onLoadRecipe })
  const modalPreview = modal.preview

  return (
    <section className="recipe-panel" aria-labelledby="recipes-title">
      <div className="recipe-header">
        <div>
          <p className="section-title">Recipes</p>
          <h2 id="recipes-title">Saved formulas</h2>
        </div>
        <span>{list.recipes.length}</span>
      </div>

      <RecipeSaveRow
        newRecipeName={save.newRecipeName}
        isLoading={status.isLoading}
        onChangeName={save.setNewRecipeName}
        onSave={save.saveNewRecipe}
      />

      {status.panelError && <p className="error-message">{status.panelError}</p>}

      <div className="recipe-list">
        {list.recipes.length === 0 ? (
          <p className="empty-recipes">No saved recipes yet.</p>
        ) : (
          list.recipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isActive={recipe.id === list.activeRecipeId}
              isCompared={comparison.recipeIds.includes(recipe.id)}
              isDisabled={status.isLoading}
              onSelect={list.openRecipe}
              onToggleCompare={comparison.toggleRecipe}
              onDelete={(recipeId) => void list.removeRecipe(recipeId, 'panel')}
            />
          ))
        )}
      </div>

      <RecipeCompareStatus
        selectedCount={comparison.recipeIds.length}
        isLoading={status.isLoading}
        onClear={comparison.clearSelection}
      />

      {comparison.data && (
        <RecipeComparisonView
          leftRecipe={comparison.data.leftRecipe}
          rightRecipe={comparison.data.rightRecipe}
          leftResult={comparison.data.leftResult}
          rightResult={comparison.data.rightResult}
          onClear={comparison.clearSelection}
        />
      )}

      {modalPreview && (
        <RecipeDetailModal
          recipe={modal.recipe ?? modalPreview.recipe}
          result={modalPreview.result}
          mode={modal.mode}
          recipeName={modal.recipeName}
          sourceRecipeName={modal.sourceRecipeName}
          isLoading={status.isLoading}
          metadata={metadata}
          form={form}
          setForm={setForm}
          compatiblePresets={compatiblePresets}
          selectedPreset={selectedPreset}
          formError={modal.error}
          resultError={modal.error}
          onChangeName={modal.setRecipeName}
          onEdit={modal.startEditing}
          onDuplicate={modal.startDuplicating}
          onPreview={modal.previewRecipe}
          onSave={modal.save}
          onDelete={() => void list.removeRecipe(modalPreview.recipe.id, 'modal')}
          onCancelEdit={modal.reset}
          onClose={modal.reset}
        />
      )}
    </section>
  )
}
