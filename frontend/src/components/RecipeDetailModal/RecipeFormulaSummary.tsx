import type { Recipe } from '../../types/recipe'
import { formatGram } from '../../utils/format'

type RecipeFormulaSummaryProps = {
  recipe: Recipe
}

export function RecipeFormulaSummary({ recipe }: RecipeFormulaSummaryProps) {
  return (
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
