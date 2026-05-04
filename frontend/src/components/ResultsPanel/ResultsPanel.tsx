import './ResultsPanel.scss'
import { DoughResultBreakdown } from '../DoughResultBreakdown'
import { FermentationTimelinePanel } from '../FermentationTimelinePanel'
import type { DoughCalculationResponse, FormState, PresetMetadata } from '../../types/dough'
import { formatGram } from '../../utils/format'

type ResultsPanelProps = {
  result: DoughCalculationResponse | null
  form: FormState
  selectedPreset: PresetMetadata | undefined
  timelineStartedAt?: Date
}

export function ResultsPanel({
  result,
  form,
  selectedPreset,
  timelineStartedAt,
}: ResultsPanelProps) {
  return (
    <section className="results-panel">
      <div className="results-live-region" aria-live="polite">
        {result ? <Results result={result} /> : <EmptyResults />}
      </div>
      <FermentationTimelinePanel
        form={form}
        selectedPreset={selectedPreset}
        startedAt={timelineStartedAt}
      />
    </section>
  )
}

function Results({ result }: { result: DoughCalculationResponse }) {
  const yeastTypeLabel = yeastTypeLabels[result.yeastCalculation.yeastType]
  const methodCopy = methodFactorCopy[result.yeastCalculation.doughMethod]

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

      <details className="yeast-explanation">
        <summary>Why this yeast amount?</summary>
        <div className="yeast-explanation__content">
          <p>
            The calculator converts your schedule into{' '}
            <strong>{formatNumber(result.yeastCalculation.effectiveFermentationHours)} effective hours</strong>
            . Room time counts faster, while cold time counts more slowly.
          </p>
          <ul className="yeast-explanation__list">
            <li>
              <span>Method factor</span>
              <strong>
                {formatNumber(result.yeastCalculation.methodFactor)}x
              </strong>
              <p>{methodCopy}</p>
            </li>
            <li>
              <span>Fresh yeast baseline</span>
              <strong>{formatPercent(result.yeastCalculation.freshYeastPercent)}</strong>
              <p>
                This is the fresh yeast percentage the model targets before converting to your
                selected yeast type.
              </p>
            </li>
            <li>
              <span>{yeastTypeLabel} yeast</span>
              <strong>{formatPercent(result.yeastCalculation.selectedYeastPercent)}</strong>
              <p>
                This is the baker&apos;s percentage used for the yeast type you selected in the
                form.
              </p>
            </li>
          </ul>
        </div>
      </details>
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

const yeastTypeLabels = {
  INSTANT: 'Instant',
  ACTIVE_DRY: 'Active dry',
  FRESH: 'Fresh',
} as const

const methodFactorCopy = {
  DIRECT: 'Direct dough keeps the full baseline, so no yeast reduction is applied.',
  POOLISH: 'Poolish uses a 0.75x factor because the preferment develops extra strength over time.',
  BIGA: 'Biga uses a 0.65x factor because this stiffer preferment needs even less yeast.',
} as const

function formatPercent(value: number) {
  return `${formatNumber(value)}%`
}

function formatNumber(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, '')
}
