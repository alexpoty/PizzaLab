import './DoughForm.scss'
import type { Dispatch, SetStateAction } from 'react'
import { methodLabels, yeastLabels } from '../../data/doughDefaults'
import type {
  DoughMetadata,
  FermentationSchedule,
  FermentationPreset,
  FormState,
  PresetMetadata,
  YeastType,
} from '../../types/dough'
import { NumberField } from '../NumberField'

type DoughFormProps = {
  metadata: DoughMetadata
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  compatiblePresets: PresetMetadata[]
  selectedPreset: PresetMetadata | undefined
  error: string | null
  isLoading: boolean
  onSubmit: () => void
  submitLabel?: string
  className?: string
}

function deriveManualMode(roomHours: number, coldHours: number): FermentationSchedule['mode'] {
  if (roomHours > 0 && coldHours > 0) {
    return 'MIXED'
  }

  if (coldHours > 0) {
    return 'COLD'
  }

  return 'ROOM'
}

function buildManualSchedule(
  form: FormState,
  selectedPreset: PresetMetadata | undefined,
): FermentationSchedule {
  const roomHours = selectedPreset?.roomHours ?? 24
  const coldHours = selectedPreset?.coldHours ?? 0

  return {
    mode: deriveManualMode(roomHours, coldHours),
    roomHours,
    roomTemperatureCelsius: form.roomTemperatureCelsius,
    coldHours,
    coldTemperatureCelsius: form.coldTemperatureCelsius,
  }
}

function getCompatiblePresetCode(
  presets: PresetMetadata[],
  preset: FermentationPreset | null,
): FermentationPreset | null {
  if (preset && presets.some((item) => item.code === preset)) {
    return preset
  }

  return presets[0]?.code ?? null
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
  submitLabel = 'Calculate dough',
  className = 'control-panel',
}: DoughFormProps) {
  const isManualMode = form.fermentationSchedule !== null
  const manualSchedule = form.fermentationSchedule

  return (
    <form
      className={className}
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
                fermentationPreset: getCompatiblePresetCode(
                  metadata.fermentationPresets.filter((preset) =>
                    preset.compatibleDoughMethods.includes(method),
                  ),
                  current.fermentationPreset,
                ),
                fermentationSchedule: current.fermentationSchedule,
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
      <div className="segmented-control segmented-control--dual" aria-label="Fermentation mode">
        <button
          type="button"
          className={isManualMode ? '' : 'active'}
          onClick={() =>
            setForm((current) => ({
              ...current,
              fermentationPreset: getCompatiblePresetCode(
                compatiblePresets,
                current.fermentationPreset,
              ),
              fermentationSchedule: null,
            }))
          }
        >
          Preset
        </button>
        <button
          type="button"
          className={isManualMode ? 'active' : ''}
          onClick={() =>
            setForm((current) => ({
              ...current,
              fermentationPreset: getCompatiblePresetCode(
                compatiblePresets,
                current.fermentationPreset,
              ),
              fermentationSchedule:
                current.fermentationSchedule ?? buildManualSchedule(current, selectedPreset),
            }))
          }
        >
          Manual
        </button>
      </div>

      {!isManualMode && (
        <label className="select-field">
          <span>Preset</span>
          <select
            value={selectedPreset?.code ?? form.fermentationPreset ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fermentationPreset: event.target.value as FermentationPreset,
                fermentationSchedule: null,
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
      )}

      <div className="field-grid">
        {isManualMode && manualSchedule ? (
          <>
            <NumberField
              label="Room hours"
              suffix="h"
              min={0}
              step={1}
              value={manualSchedule.roomHours}
              onChange={(roomHours) =>
                setForm((current) => {
                  const schedule = current.fermentationSchedule ?? buildManualSchedule(current, selectedPreset)
                  return {
                    ...current,
                    fermentationSchedule: {
                      ...schedule,
                      roomHours,
                      mode: deriveManualMode(roomHours, schedule.coldHours),
                    },
                  }
                })
              }
            />
            <NumberField
              label="Room temp"
              suffix="C"
              min={1}
              step={0.5}
              value={manualSchedule.roomTemperatureCelsius}
              onChange={(roomTemperatureCelsius) =>
                setForm((current) => {
                  const schedule = current.fermentationSchedule ?? buildManualSchedule(current, selectedPreset)
                  return {
                    ...current,
                    fermentationSchedule: {
                      ...schedule,
                      roomTemperatureCelsius,
                    },
                  }
                })
              }
            />
            <NumberField
              label="Cold hours"
              suffix="h"
              min={0}
              step={1}
              value={manualSchedule.coldHours}
              onChange={(coldHours) =>
                setForm((current) => {
                  const schedule = current.fermentationSchedule ?? buildManualSchedule(current, selectedPreset)
                  return {
                    ...current,
                    fermentationSchedule: {
                      ...schedule,
                      coldHours,
                      mode: deriveManualMode(schedule.roomHours, coldHours),
                    },
                  }
                })
              }
            />
            <NumberField
              label="Fridge temp"
              suffix="C"
              min={1}
              step={0.5}
              value={manualSchedule.coldTemperatureCelsius}
              onChange={(coldTemperatureCelsius) =>
                setForm((current) => {
                  const schedule = current.fermentationSchedule ?? buildManualSchedule(current, selectedPreset)
                  return {
                    ...current,
                    fermentationSchedule: {
                      ...schedule,
                      coldTemperatureCelsius,
                    },
                  }
                })
              }
            />
          </>
        ) : (
          <>
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
          </>
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
        {isLoading ? 'Calculating...' : submitLabel}
      </button>
    </form>
  )
}
