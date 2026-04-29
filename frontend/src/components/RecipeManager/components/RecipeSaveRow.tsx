type RecipeSaveRowProps = {
  newRecipeName: string
  isLoading: boolean
  onChangeName: (name: string) => void
  onSave: () => void
}

export function RecipeSaveRow({
  newRecipeName,
  isLoading,
  onChangeName,
  onSave,
}: RecipeSaveRowProps) {
  return (
    <div className="recipe-save-row">
      <label>
        <span>Name</span>
        <input
          value={newRecipeName}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="24h room direct"
        />
      </label>
      <button type="button" onClick={onSave} disabled={isLoading}>
        Save current
      </button>
    </div>
  )
}
