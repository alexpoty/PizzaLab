import './RecipeListItem.scss'
import type { Recipe } from '../../types/recipe'

type RecipeListItemProps = {
  recipe: Recipe
  isActive: boolean
  isCompared: boolean
  isDisabled: boolean
  onSelect: (recipe: Recipe) => void
  onToggleCompare: (recipe: Recipe) => void
  onDelete: (recipeId: string) => void
}

export function RecipeListItem({
  recipe,
  isActive,
  isCompared,
  isDisabled,
  onSelect,
  onToggleCompare,
  onDelete,
}: RecipeListItemProps) {
  return (
    <article
      className={`recipe-item${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-pressed={isActive}
      onClick={() => {
        if (!isDisabled) {
          onSelect(recipe)
        }
      }}
      onKeyDown={(event) => {
        if (isDisabled) {
          return
        }

        if (event.currentTarget !== event.target) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(recipe)
        }
      }}
    >
      <div className="recipe-item-body">
        <h3>{recipe.name}</h3>
        <p>
          {recipe.formula.doughMethod.toLowerCase()} · {recipe.formula.hydrationPercent}%
          hydration · {recipe.formula.saltPercent}% salt
        </p>
      </div>
      <div className="recipe-actions">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleCompare(recipe)
          }}
          disabled={isDisabled}
          aria-pressed={isCompared}
        >
          {isCompared ? 'Selected' : 'Compare'}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(recipe.id)
          }}
          disabled={isDisabled}
          aria-label={`Delete ${recipe.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
