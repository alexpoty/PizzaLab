import './App.css'
import { DoughForm } from './components/DoughForm'
import { ResultsPanel } from './components/ResultsPanel'
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
      </section>
    </main>
  )
}

export default App
