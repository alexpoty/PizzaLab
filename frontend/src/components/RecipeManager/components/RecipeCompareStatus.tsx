type RecipeCompareStatusProps = {
  selectedCount: number
  isLoading: boolean
  onClear: () => void
}

export function RecipeCompareStatus({
  selectedCount,
  isLoading,
  onClear,
}: RecipeCompareStatusProps) {
  return (
    <div className="recipe-compare-status" aria-live="polite">
      <p>
        Compare selection: <strong>{selectedCount}</strong>/2
      </p>
      {selectedCount > 0 && (
        <button type="button" onClick={onClear} disabled={isLoading}>
          Clear compare
        </button>
      )}
    </div>
  )
}
