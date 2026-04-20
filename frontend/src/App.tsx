import { useEffect, useMemo, useState } from 'react'
import './App.css'

type DoughMethod = 'DIRECT' | 'POOLISH' | 'BIGA'
type YeastType = 'INSTANT' | 'ACTIVE_DRY' | 'FRESH'
type FermentationPreset =
  | 'ROOM_24H'
  | 'COLD_24H'
  | 'COLD_48H'
  | 'POOLISH_ROOM_16H_COLD_24H'
  | 'BIGA_ROOM_16H_COLD_24H'

type PresetMetadata = {
  code: FermentationPreset
  label: string
  compatibleDoughMethods: DoughMethod[]
  requiresRoomTemperature: boolean
  requiresColdTemperature: boolean
  roomHours: number
  coldHours: number
}

type DoughMetadata = {
  doughMethods: DoughMethod[]
  yeastTypes: YeastType[]
  fermentationPresets: PresetMetadata[]
}

type DoughCalculationResponse = {
  flourGrams: number
  waterGrams: number
  saltGrams: number
  yeastGrams: number
  totalDoughWeightGrams: number
  preferment: IngredientGroup | null
  finalMix: IngredientGroup
  yeastCalculation: {
    yeastType: YeastType
    doughMethod: DoughMethod
    roomEffectHours: number
    coldEffectHours: number
    effectiveFermentationHours: number
    freshYeastPercent: number
    selectedYeastPercent: number
    freshYeastEquivalentGrams: number
    selectedYeastGrams: number
    prefermentYeastGrams: number
    finalMixYeastGrams: number
  }
}

type IngredientGroup = {
  flourGrams: number
  waterGrams: number
  saltGrams?: number
  yeastGrams: number
}

type FormState = {
  pizzaCount: number
  doughBallWeightGrams: number
  hydrationPercent: number
  saltPercent: number
  yeastType: YeastType
  doughMethod: DoughMethod
  fermentationPreset: FermentationPreset
  roomTemperatureCelsius: number
  coldTemperatureCelsius: number
  prefermentFlourPercent: number
}

const defaultMetadata: DoughMetadata = {
  doughMethods: ['DIRECT', 'POOLISH', 'BIGA'],
  yeastTypes: ['INSTANT', 'ACTIVE_DRY', 'FRESH'],
  fermentationPresets: [
    {
      code: 'ROOM_24H',
      label: '24h room fermentation',
      compatibleDoughMethods: ['DIRECT', 'POOLISH', 'BIGA'],
      requiresRoomTemperature: true,
      requiresColdTemperature: false,
      roomHours: 24,
      coldHours: 0,
    },
    {
      code: 'COLD_24H',
      label: '24h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 24,
    },
    {
      code: 'COLD_48H',
      label: '48h cold fermentation',
      compatibleDoughMethods: ['DIRECT'],
      requiresRoomTemperature: false,
      requiresColdTemperature: true,
      roomHours: 0,
      coldHours: 48,
    },
    {
      code: 'POOLISH_ROOM_16H_COLD_24H',
      label: 'Poolish 16h room + 24h cold',
      compatibleDoughMethods: ['POOLISH'],
      requiresRoomTemperature: true,
      requiresColdTemperature: true,
      roomHours: 16,
      coldHours: 24,
    },
    {
      code: 'BIGA_ROOM_16H_COLD_24H',
      label: 'Biga 16h room + 24h cold',
      compatibleDoughMethods: ['BIGA'],
      requiresRoomTemperature: true,
      requiresColdTemperature: true,
      roomHours: 16,
      coldHours: 24,
    },
  ],
}

const defaultForm: FormState = {
  pizzaCount: 4,
  doughBallWeightGrams: 270,
  hydrationPercent: 62,
  saltPercent: 3,
  yeastType: 'INSTANT',
  doughMethod: 'DIRECT',
  fermentationPreset: 'COLD_24H',
  roomTemperatureCelsius: 20,
  coldTemperatureCelsius: 5,
  prefermentFlourPercent: 30,
}

const methodLabels: Record<DoughMethod, string> = {
  DIRECT: 'Direct',
  POOLISH: 'Poolish',
  BIGA: 'Biga',
}

const yeastLabels: Record<YeastType, string> = {
  INSTANT: 'Instant',
  ACTIVE_DRY: 'Active dry',
  FRESH: 'Fresh',
}

function App() {
  const [metadata, setMetadata] = useState<DoughMetadata>(defaultMetadata)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [result, setResult] = useState<DoughCalculationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dough/metadata')
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: DoughMetadata) => setMetadata(data))
      .catch(() => setMetadata(defaultMetadata))
  }, [])

  const compatiblePresets = useMemo(
    () =>
      metadata.fermentationPresets.filter((preset) =>
        preset.compatibleDoughMethods.includes(form.doughMethod),
      ),
    [form.doughMethod, metadata.fermentationPresets],
  )
  const selectedPreset =
    compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
    compatiblePresets[0]

  const calculate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const requestBody = {
        pizzaCount: form.pizzaCount,
        doughBallWeightGrams: form.doughBallWeightGrams,
        hydrationPercent: form.hydrationPercent,
        saltPercent: form.saltPercent,
        yeastType: form.yeastType,
        doughMethod: form.doughMethod,
        fermentationPreset: selectedPreset?.code ?? form.fermentationPreset,
        roomTemperatureCelsius: selectedPreset?.requiresRoomTemperature
          ? form.roomTemperatureCelsius
          : undefined,
        coldTemperatureCelsius: selectedPreset?.requiresColdTemperature
          ? form.coldTemperatureCelsius
          : undefined,
        prefermentFlourPercent:
          form.doughMethod === 'DIRECT' ? undefined : form.prefermentFlourPercent,
      }
      const response = await fetch('/api/dough/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message ?? 'Calculation failed')
      }
      setResult(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Calculation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">PizzaLab</p>
            <h1>Neapolitan dough calculator</h1>
          </div>
          <div className="total-badge">
            <span>{form.pizzaCount} pizzas</span>
            <strong>{form.pizzaCount * form.doughBallWeightGrams}g</strong>
          </div>
        </header>

        <section className="calculator-grid">
          <form
            className="control-panel"
            onSubmit={(event) => {
              event.preventDefault()
              void calculate()
            }}
          >
            <div className="section-title">Dough</div>
            <div className="segmented-control" aria-label="Dough method">
              {metadata.doughMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={form.doughMethod === method ? 'active' : ''}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      doughMethod: method,
                      fermentationPreset:
                        metadata.fermentationPresets.find((preset) =>
                          preset.compatibleDoughMethods.includes(method),
                        )?.code ?? current.fermentationPreset,
                      prefermentFlourPercent: method === 'BIGA' ? 45 : 30,
                    }))
                  }
                >
                  {methodLabels[method]}
                </button>
              ))}
            </div>

            <div className="field-grid">
              <NumberField
                label="Pizzas"
                min={1}
                value={form.pizzaCount}
                onChange={(pizzaCount) => setForm((current) => ({ ...current, pizzaCount }))}
              />
              <NumberField
                label="Ball weight"
                suffix="g"
                min={1}
                value={form.doughBallWeightGrams}
                onChange={(doughBallWeightGrams) =>
                  setForm((current) => ({ ...current, doughBallWeightGrams }))
                }
              />
              <NumberField
                label="Hydration"
                suffix="%"
                min={1}
                value={form.hydrationPercent}
                onChange={(hydrationPercent) =>
                  setForm((current) => ({ ...current, hydrationPercent }))
                }
              />
              <NumberField
                label="Salt"
                suffix="%"
                min={0}
                step={0.1}
                value={form.saltPercent}
                onChange={(saltPercent) => setForm((current) => ({ ...current, saltPercent }))}
              />
            </div>

            {form.doughMethod !== 'DIRECT' && (
              <NumberField
                label="Preferment flour"
                suffix="%"
                min={1}
                max={99}
                value={form.prefermentFlourPercent}
                onChange={(prefermentFlourPercent) =>
                  setForm((current) => ({ ...current, prefermentFlourPercent }))
                }
              />
            )}

            <div className="section-title">Fermentation</div>
            <label className="select-field">
              <span>Preset</span>
              <select
                value={selectedPreset?.code ?? form.fermentationPreset}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fermentationPreset: event.target.value as FermentationPreset,
                  }))
                }
              >
                {compatiblePresets.map((preset) => (
                  <option key={preset.code} value={preset.code}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-grid">
              {selectedPreset?.requiresRoomTemperature && (
                <NumberField
                  label="Room temp"
                  suffix="C"
                  min={1}
                  step={0.5}
                  value={form.roomTemperatureCelsius}
                  onChange={(roomTemperatureCelsius) =>
                    setForm((current) => ({ ...current, roomTemperatureCelsius }))
                  }
                />
              )}
              {selectedPreset?.requiresColdTemperature && (
                <NumberField
                  label="Fridge temp"
                  suffix="C"
                  min={1}
                  step={0.5}
                  value={form.coldTemperatureCelsius}
                  onChange={(coldTemperatureCelsius) =>
                    setForm((current) => ({ ...current, coldTemperatureCelsius }))
                  }
                />
              )}
              <label className="select-field">
                <span>Yeast</span>
                <select
                  value={form.yeastType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, yeastType: event.target.value as YeastType }))
                  }
                >
                  {metadata.yeastTypes.map((type) => (
                    <option key={type} value={type}>
                      {yeastLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && <p className="error-message">{error}</p>}
            <button className="calculate-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Calculate dough'}
            </button>
          </form>

          <section className="results-panel" aria-live="polite">
            {result ? <Results result={result} /> : <EmptyResults />}
          </section>
        </section>
      </section>
    </main>
  )
}

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

function NumberField({ label, value, onChange, min, max, step = 1, suffix }: NumberFieldProps) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
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
      {typeof group.saltGrams === 'number' && <IngredientRow label="Salt" value={group.saltGrams} compact />}
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

export default App
