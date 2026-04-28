import { DoughResultBreakdown } from '../DoughResultBreakdown'
import type { DoughCalculationResponse } from '../../types/dough'

type RecipeIngredientSummaryProps = {
  result: DoughCalculationResponse | null
}

export function RecipeIngredientSummary({ result }: RecipeIngredientSummaryProps) {
  return (
    <div className="recipe-summary-block">
      <h3>Ingredients</h3>
      {result ? (
        <DoughResultBreakdown result={result} layout="modal" />
      ) : (
        <p className="empty-recipes">Preview unavailable for this saved formula.</p>
      )}
    </div>
  )
}
