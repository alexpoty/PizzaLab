import './RecipeComparisonView.scss'
import type { DoughCalculationResponse } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { formatGram } from '../../utils/format'

type RecipeComparisonViewProps = {
  leftRecipe: Recipe
  rightRecipe: Recipe
  leftResult: DoughCalculationResponse
  rightResult: DoughCalculationResponse
  onClear: () => void
}

type ComparisonMetric = {
  key: 'flourGrams' | 'waterGrams' | 'saltGrams' | 'yeastGrams'
  label: string
}

const comparisonMetrics: ComparisonMetric[] = [
  { key: 'flourGrams', label: 'Flour' },
  { key: 'waterGrams', label: 'Water' },
  { key: 'saltGrams', label: 'Salt' },
  { key: 'yeastGrams', label: 'Yeast' },
]

export function RecipeComparisonView({
  leftRecipe,
  rightRecipe,
  leftResult,
  rightResult,
  onClear,
}: RecipeComparisonViewProps) {
  return (
    <section className="recipe-comparison" aria-labelledby="recipe-comparison-title">
      <div className="recipe-comparison-header">
        <div>
          <p className="section-title">Comparison</p>
          <h3 id="recipe-comparison-title">Recipe delta view</h3>
        </div>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>

      <p className="recipe-comparison-hint">
        Comparing <strong>{rightRecipe.name}</strong> against <strong>{leftRecipe.name}</strong>.
      </p>

      <div className="recipe-comparison-grid" role="table" aria-label="Recipe comparison">
        <div className="recipe-comparison-head recipe-comparison-corner" role="columnheader">
          Ingredient
        </div>
        <div className="recipe-comparison-head" role="columnheader">
          <span>{leftRecipe.name}</span>
          <em>{leftRecipe.formula.doughMethod.toLowerCase()}</em>
        </div>
        <div className="recipe-comparison-head" role="columnheader">
          <span>{rightRecipe.name}</span>
          <em>{rightRecipe.formula.doughMethod.toLowerCase()}</em>
        </div>
        <div className="recipe-comparison-head" role="columnheader">
          Delta
        </div>

        {comparisonMetrics.map((metric) => {
          const leftValue = leftResult[metric.key]
          const rightValue = rightResult[metric.key]
          const delta = rightValue - leftValue
          const deltaTone = delta === 0 ? 'neutral' : delta > 0 ? 'increase' : 'decrease'

          return (
            <Row
              key={metric.key}
              label={metric.label}
              leftValue={leftValue}
              rightValue={rightValue}
              delta={delta}
              deltaTone={deltaTone}
            />
          )
        })}
      </div>
    </section>
  )
}

function Row({
  label,
  leftValue,
  rightValue,
  delta,
  deltaTone,
}: {
  label: string
  leftValue: number
  rightValue: number
  delta: number
  deltaTone: 'increase' | 'decrease' | 'neutral'
}) {
  return (
    <>
      <div className="recipe-comparison-label" role="rowheader">
        {label}
      </div>
      <div className="recipe-comparison-value" role="cell">
        {formatGram(leftValue)}
      </div>
      <div className="recipe-comparison-value" role="cell">
        {formatGram(rightValue)}
      </div>
      <div className={`recipe-comparison-delta ${deltaTone}`} role="cell">
        <span aria-hidden="true">{deltaTone === 'increase' ? '▲' : deltaTone === 'decrease' ? '▼' : '•'}</span>
        <strong>{formatSignedGram(delta)}</strong>
      </div>
    </>
  )
}

function formatSignedGram(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}g`
}
