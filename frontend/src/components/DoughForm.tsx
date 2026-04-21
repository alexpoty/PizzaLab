import type { Dispatch, SetStateAction } from 'react'
import { methodLabels, yeastLabels } from '../data/doughDefaults'
import type {
  DoughMetadata,
  FermentationPreset,
  FormState,
  PresetMetadata,
  YeastType,
} from '../types/dough'
import { NumberField } from './NumberField'

type DoughFormProps = {
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  error: string | null
  isLoading: boolean
  onSubmit: () => void
}

export function DoughForm({
  metadata,
  form,
  setForm,
  compatiblePresets,
  selectedPreset,
  error,
  isLoading,
  onSubmit,
}: DoughFormProps) {
  return (
    <form
      className="control-panel"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
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
  )
}
