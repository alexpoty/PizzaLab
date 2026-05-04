import './ResultsPanel.scss'
import { FermentationTimelinePanel } from '../FermentationTimelinePanel'
import { CalculatedResults } from './CalculatedResults'
import type { DoughCalculationResponse, FormState, PresetMetadata } from '../../types/dough'

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
        {result ? <CalculatedResults result={result} /> : <EmptyResults />}
      </div>
      <FermentationTimelinePanel
        form={form}
        selectedPreset={selectedPreset}
        startedAt={timelineStartedAt}
      />
    </section>
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
