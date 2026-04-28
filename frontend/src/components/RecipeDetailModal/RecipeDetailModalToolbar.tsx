import type { ModalMode } from '../RecipeManager/recipeManagerTypes'

type RecipeDetailModalToolbarProps = {
  mode: ModalMode
  recipeName: string
  isLoading: boolean
  onChangeName: (name: string) => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSave: () => void
  onCancelEdit: () => void
}

export function RecipeDetailModalToolbar({
  mode,
  recipeName,
  isLoading,
  onChangeName,
  onEdit,
  onDuplicate,
  onDelete,
  onSave,
  onCancelEdit,
}: RecipeDetailModalToolbarProps) {
  if (mode === 'view') {
    return (
      <div className="recipe-modal-toolbar">
        <button type="button" onClick={onEdit} disabled={isLoading}>
          Edit recipe
        </button>
        <button type="button" onClick={onDuplicate} disabled={isLoading}>
          Duplicate
        </button>
        <button type="button" onClick={onDelete} disabled={isLoading}>
          Delete
        </button>
      </div>
    )
  }

  return (
    <div className="recipe-modal-toolbar">
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
    </div>
  )
}
