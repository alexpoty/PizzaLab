import type { Recipe } from '../types/recipe'

type RecipeListItemProps = {
  recipe: Recipe
  isActive: boolean
  isDisabled: boolean
  onSelect: (recipe: Recipe) => void
}

export function RecipeListItem({
  recipe,
  isActive,
  isDisabled,
  onSelect,
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

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(recipe)
        }
      }}
    >
      <div>
        <h3>{recipe.name}</h3>
        <p>
          {recipe.formula.doughMethod.toLowerCase()} · {recipe.formula.hydrationPercent}%
          hydration · {recipe.formula.saltPercent}% salt
        </p>
      </div>
    </article>
  )
}
