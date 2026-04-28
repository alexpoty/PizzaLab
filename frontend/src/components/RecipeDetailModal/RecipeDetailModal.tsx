import './RecipeDetailModal.scss'
import type { Dispatch, SetStateAction } from 'react'
import { DoughForm } from '../DoughForm'
import type { DoughCalculationResponse } from '../../types/dough'
import type { DoughMetadata, FormState, PresetMetadata } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import type { ModalMode } from '../RecipeManager/recipeManagerTypes'
import { RecipeDetailModalToolbar } from './RecipeDetailModalToolbar'
import { RecipeFormulaSummary } from './RecipeFormulaSummary'
import { RecipeIngredientSummary } from './RecipeIngredientSummary'

type RecipeDetailModalProps = {
  recipe: Recipe
  result: DoughCalculationResponse | null
  mode: ModalMode
  recipeName: string
  sourceRecipeName: string | null
  isLoading: boolean
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  formError: string | null
  resultError: string | null
  onChangeName: (name: string) => void
  onEdit: () => void
  onDuplicate: () => void
  onPreview: () => void
  onSave: () => void
  onDelete: () => void
  onCancelEdit: () => void
  onClose: () => void
}

export function RecipeDetailModal({
  recipe,
  result,
  mode,
  recipeName,
  sourceRecipeName,
  isLoading,
  metadata,
  form,
  setForm,
  compatiblePresets,
  selectedPreset,
  formError,
  resultError,
  onChangeName,
  onEdit,
  onDuplicate,
  onPreview,
  onSave,
  onDelete,
  onCancelEdit,
  onClose,
}: RecipeDetailModalProps) {
  return (
    <div className="recipe-modal-backdrop" role="presentation">
      <section
        className="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
      >
        <header className="recipe-modal-header">
          <div>
            <p className="section-title">Recipe</p>
            <h2 id="recipe-modal-title">{recipe.name}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isLoading}>
            Close
          </button>
        </header>

        <RecipeDetailModalToolbar
          mode={mode}
          recipeName={recipeName}
          isLoading={isLoading}
          onChangeName={onChangeName}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
        />

        <p className="recipe-modal-hint">{buildModalHint(mode, recipeName, sourceRecipeName)}</p>

        {mode !== 'view' && (
          <DoughForm
            metadata={metadata}
            form={form}
            setForm={setForm}
            compatiblePresets={compatiblePresets}
            selectedPreset={selectedPreset}
            error={formError}
            isLoading={isLoading}
            onSubmit={onPreview}
            submitLabel="Preview dough"
            className="recipe-modal-form"
          />
        )}

        {mode === 'view' && resultError && <p className="error-message">{resultError}</p>}

        <div className="recipe-modal-grid">
          <RecipeIngredientSummary result={result} />
          <RecipeFormulaSummary recipe={recipe} />
        </div>
      </section>
    </div>
  )
}

function buildModalHint(
  mode: ModalMode,
  recipeName: string,
  sourceRecipeName: string | null,
) {
  if (mode === 'edit') {
    return `Recipe "${recipeName}" is editable here. Change hydration, method, temperatures, and the rest of the formula below, preview if needed, then save here.`
  }

  if (mode === 'duplicate' && sourceRecipeName) {
    return `Copy draft from "${sourceRecipeName}" is editable here. Tweak the full formula below, preview if needed, then save the copy here.`
  }

  return 'Click Edit recipe to change the loaded formula, or Duplicate to create a new variant from this recipe.'
}
