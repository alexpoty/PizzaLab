import { DoughResultBreakdown } from '../DoughResultBreakdown'
import type { DoughCalculationResponse } from '../../types/dough'
import { formatGram } from '../../utils/format'
import { YeastExplanation } from './YeastExplanation'
import { buildYeastCalculationViewModel } from './yeastCalculationPresenter'

type CalculatedResultsProps = {
  result: DoughCalculationResponse
}

export function CalculatedResults({ result }: CalculatedResultsProps) {
  const yeastCalculation = buildYeastCalculationViewModel(result.yeastCalculation)

  return (
    <>
      <div className="result-header">
        <div>
          <p className="eyebrow">Total dough</p>
          <h2>{formatGram(result.totalDoughWeightGrams)}</h2>
        </div>
        <div className="yeast-pill">{formatGram(result.yeastGrams)} yeast</div>
      </div>

      <DoughResultBreakdown result={result} />

      <div className="yeast-details">
        {yeastCalculation.summaryChips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>

      <YeastExplanation yeastCalculation={result.yeastCalculation} />
    </>
  )
}
