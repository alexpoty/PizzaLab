import './ResultsPanel.scss'
import { DoughResultBreakdown } from '../DoughResultBreakdown'
import type { DoughCalculationResponse } from '../../types/dough'
import { formatGram } from '../../utils/format'

type ResultsPanelProps = {
  result: DoughCalculationResponse | null
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <section className="results-panel" aria-live="polite">
      {result ? <Results result={result} /> : <EmptyResults />}
    </section>
  )
}

function Results({ result }: { result: DoughCalculationResponse }) {
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
        <span>{result.yeastCalculation.yeastType}</span>
        <span>{result.yeastCalculation.selectedYeastPercent}% selected</span>
        <span>{result.yeastCalculation.freshYeastPercent}% fresh equivalent</span>
        <span>{result.yeastCalculation.effectiveFermentationHours} effective hours</span>
      </div>
    </>
  )
}

function EmptyResults() {
  return (
    <div className="empty-results">
      <h2>Ready to calculate</h2>
      <p>Select a method, fermentation preset, and temperatures to calculate the dough.</p>
    </div>
  )
}
