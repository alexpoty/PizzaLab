import type { Recipe } from '../types/recipe'

type RecipeListItemProps = {
  recipe: Recipe
  isDisabled: boolean
  onOpen: (recipe: Recipe) => void
  onDelete: (recipeId: string) => void
}

export function RecipeListItem({ recipe, isDisabled, onOpen, onDelete }: RecipeListItemProps) {
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
        <button type="button" onClick={() => onOpen(recipe)} disabled={isDisabled}>
          Open
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
