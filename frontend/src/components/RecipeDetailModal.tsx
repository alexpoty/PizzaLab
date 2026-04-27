import type { Dispatch, SetStateAction } from 'react'
import { DoughForm } from './DoughForm'
import type { DoughCalculationResponse } from '../types/dough'
import type { DoughMetadata, FormState, PresetMetadata } from '../types/dough'
import type { Recipe } from '../types/recipe'

type RecipeModalMode = 'view' | 'edit' | 'duplicate'

type RecipeDetailModalProps = {
  recipe: Recipe
  result: DoughCalculationResponse
  mode: RecipeModalMode
  recipeName: string
  sourceRecipeName: string | null
  isLoading: boolean
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  formError: string | null
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

        <div className="recipe-modal-toolbar">
          {mode === 'view' ? (
            <>
              <button type="button" onClick={onEdit} disabled={isLoading}>
                Edit recipe
              </button>
              <button type="button" onClick={onDuplicate} disabled={isLoading}>
                Duplicate
              </button>
              <button type="button" onClick={onDelete} disabled={isLoading}>
                Delete
              </button>
            </>
          ) : (
            <>
              <label className="recipe-modal-name-field">
                <span>{mode === 'duplicate' ? 'Copy name' : 'Recipe name'}</span>
                <input
                  value={recipeName}
                  onChange={(event) => onChangeName(event.target.value)}
                  placeholder="24h room direct"
                />
              </label>
              <div className="recipe-modal-action-row">
                <button type="button" onClick={onSave} disabled={isLoading}>
                  {mode === 'duplicate' ? 'Save copy' : 'Update recipe'}
                </button>
                <button type="button" onClick={onCancelEdit} disabled={isLoading}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

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

        <div className="recipe-modal-grid">
          <div className="recipe-summary-block">
            <h3>Ingredients</h3>
            <div className="recipe-ingredients large">
              <span>Flour {formatGram(result.flourGrams)}</span>
              <span>Water {formatGram(result.waterGrams)}</span>
              <span>Salt {formatGram(result.saltGrams)}</span>
              <span>Yeast {formatGram(result.yeastGrams)}</span>
            </div>
          </div>

          <div className="recipe-summary-block">
            <h3>Formula</h3>
            <dl className="recipe-facts">
              <FormulaFact label="Method" value={recipe.formula.doughMethod} />
              <FormulaFact label="Hydration" value={`${recipe.formula.hydrationPercent}%`} />
              <FormulaFact label="Salt" value={`${recipe.formula.saltPercent}%`} />
              <FormulaFact label="Yeast" value={recipe.formula.yeastType} />
              <FormulaFact label="Pizzas" value={recipe.formula.pizzaCount} />
              <FormulaFact label="Ball weight" value={formatGram(recipe.formula.doughBallWeightGrams)} />
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}

function buildModalHint(
  mode: RecipeModalMode,
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

function FormulaFact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function formatGram(value: number) {
  return `${value.toFixed(1)}g`
}
