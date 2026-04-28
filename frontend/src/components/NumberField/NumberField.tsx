import './NumberField.scss'

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export function NumberField({ label, value, onChange, min, max, step = 1, suffix }: NumberFieldProps) {
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
