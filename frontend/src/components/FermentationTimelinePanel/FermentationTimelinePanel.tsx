import './FermentationTimelinePanel.scss'
import type { FormState, PresetMetadata } from '../../types/dough'
import {
  buildFermentationTimeline,
  getTimelineSummaryLabel,
} from '../../utils/fermentationTimeline'

type FermentationTimelinePanelProps = {
  form: FormState
  selectedPreset: PresetMetadata | undefined
  startedAt?: Date
}

export function FermentationTimelinePanel({
  form,
  selectedPreset,
  startedAt,
}: FermentationTimelinePanelProps) {
  const entries = buildFermentationTimeline(form, selectedPreset, startedAt)

  return (
    <section className="timeline-panel" aria-labelledby="timeline-title">
      <div className="timeline-header">
        <div>
          <p className="section-title">Timeline</p>
          <h3 id="timeline-title">From mixing to bake</h3>
        </div>
        <span className="timeline-summary">{getTimelineSummaryLabel(form)}</span>
      </div>

      <ol className="timeline-list">
        {entries.map((entry) => (
          <li key={entry.key} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true" />
            <div className="timeline-content">
              <div className="timeline-row">
                <strong>{entry.title}</strong>
                <span>{entry.timestamp}</span>
              </div>
              {(entry.durationLabel || entry.timeRangeLabel) && (
                <div className="timeline-meta">
                  {entry.durationLabel && <span>{entry.durationLabel}</span>}
                  {entry.timeRangeLabel && <span>{entry.timeRangeLabel}</span>}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
