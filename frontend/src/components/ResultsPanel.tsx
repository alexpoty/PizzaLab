import type { DoughCalculationResponse, IngredientGroup } from '../types/dough'

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

      <div className="ingredient-list">
        <IngredientRow label="Flour" value={result.flourGrams} />
        <IngredientRow label="Water" value={result.waterGrams} />
        <IngredientRow label="Salt" value={result.saltGrams} />
        <IngredientRow label="Yeast" value={result.yeastGrams} />
      </div>

      {result.preferment && (
        <div className="mix-grid">
          <MixBlock title="Preferment" group={result.preferment} />
          <MixBlock title="Final mix" group={result.finalMix} />
        </div>
      )}

      {!result.preferment && <MixBlock title="Final mix" group={result.finalMix} />}

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

function MixBlock({ title, group }: { title: string; group: IngredientGroup }) {
  return (
    <div className="mix-block">
      <h3>{title}</h3>
      <IngredientRow label="Flour" value={group.flourGrams} compact />
      <IngredientRow label="Water" value={group.waterGrams} compact />
      {typeof group.saltGrams === 'number' && (
        <IngredientRow label="Salt" value={group.saltGrams} compact />
      )}
      <IngredientRow label="Yeast" value={group.yeastGrams} compact />
    </div>
  )
}

function IngredientRow({ label, value, compact = false }: { label: string; value: number; compact?: boolean }) {
  return (
    <div className={compact ? 'ingredient-row compact' : 'ingredient-row'}>
      <span>{label}</span>
      <strong>{formatGram(value)}</strong>
    </div>
  )
}

function formatGram(value: number) {
  return `${value.toFixed(1)}g`
}
