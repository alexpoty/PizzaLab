import type { DoughCalculationResponse } from '../types/dough'
import type { Recipe } from '../types/recipe'

type RecipeDetailModalProps = {
  recipe: Recipe
  result: DoughCalculationResponse
  onClose: () => void
}

export function RecipeDetailModal({ recipe, result, onClose }: RecipeDetailModalProps) {
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
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

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
