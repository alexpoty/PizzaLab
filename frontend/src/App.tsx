import './App.css'
import type { DoughCalculationRequest, FormState } from './types/dough'
import { DoughForm } from './components/DoughForm'
import { RecipeManager } from './components/RecipeManager'
import { ResultsPanel } from './components/ResultsPanel'
import { buildCalculationRequest } from './api/doughApi'
import { useDoughCalculator } from './hooks/useDoughCalculator'

function App() {
  const {
    metadata,
    form,
    setForm,
    result,
    isLoading,
    error,
    compatiblePresets,
    selectedPreset,
    calculate,
  } = useDoughCalculator()
  const currentFormula = buildCalculationRequest(form, selectedPreset)
  const loadRecipe = (formula: DoughCalculationRequest) => {
    setForm((current): FormState => ({
      ...current,
      pizzaCount: formula.pizzaCount,
      doughBallWeightGrams: formula.doughBallWeightGrams,
      hydrationPercent: formula.hydrationPercent,
      saltPercent: formula.saltPercent,
      yeastType: formula.yeastType,
      doughMethod: formula.doughMethod,
      fermentationPreset: formula.fermentationSchedule
        ? null
        : formula.fermentationPreset ?? current.fermentationPreset,
      fermentationSchedule: formula.fermentationSchedule ?? null,
      roomTemperatureCelsius:
        formula.roomTemperatureCelsius ??
        formula.fermentationSchedule?.roomTemperatureCelsius ??
        current.roomTemperatureCelsius,
      coldTemperatureCelsius:
        formula.coldTemperatureCelsius ??
        formula.fermentationSchedule?.coldTemperatureCelsius ??
        current.coldTemperatureCelsius,
      prefermentFlourPercent:
        formula.prefermentFlourPercent ?? current.prefermentFlourPercent,
    }))
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
          <DoughForm
            metadata={metadata}
            form={form}
            setForm={setForm}
            compatiblePresets={compatiblePresets}
            selectedPreset={selectedPreset}
            error={error}
            isLoading={isLoading}
            onSubmit={calculate}
          />
          <ResultsPanel result={result} />
        </section>

        <RecipeManager formula={currentFormula} onLoadRecipe={loadRecipe} />
      </section>
    </main>
  )
}

export default App
