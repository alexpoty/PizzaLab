import type { Recipe } from '../types/recipe'

type RecipeListItemProps = {
  recipe: Recipe
  isDisabled: boolean
  onLoad: (recipe: Recipe) => void
  onEdit: (recipe: Recipe) => void
  onDuplicate: (recipe: Recipe) => void
  onDelete: (recipeId: string) => void
}

export function RecipeListItem({
  recipe,
  isDisabled,
  onLoad,
  onEdit,
  onDuplicate,
  onDelete,
}: RecipeListItemProps) {
  return (
    <article className="recipe-item">
      <div>
        <h3>{recipe.name}</h3>
        <p>
          {recipe.formula.doughMethod.toLowerCase()} · {recipe.formula.hydrationPercent}%
          hydration · {recipe.formula.saltPercent}% salt
        </p>
      </div>
      <div className="recipe-actions">
        <button type="button" onClick={() => onLoad(recipe)} disabled={isDisabled}>
          Load
        </button>
        <button type="button" onClick={() => onEdit(recipe)} disabled={isDisabled}>
          Edit
        </button>
        <button type="button" onClick={() => onDuplicate(recipe)} disabled={isDisabled}>
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => onDelete(recipe.id)}
          disabled={isDisabled}
          aria-label={`Delete ${recipe.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
