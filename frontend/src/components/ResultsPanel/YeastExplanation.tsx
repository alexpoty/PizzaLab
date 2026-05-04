import type { DoughCalculationResponse } from '../../types/dough'
import { buildYeastCalculationViewModel } from './yeastCalculationPresenter'

type YeastExplanationProps = {
  yeastCalculation: DoughCalculationResponse['yeastCalculation']
}

export function YeastExplanation({ yeastCalculation }: YeastExplanationProps) {
  const model = buildYeastCalculationViewModel(yeastCalculation)

  return (
    <details className="yeast-explanation">
      <summary>Why this yeast amount?</summary>
      <div className="yeast-explanation__content">
        <p>
          The calculator converts your schedule into{' '}
          <strong>{model.effectiveHoursText}</strong>. Room time counts faster, while cold time
          counts more slowly.
        </p>
        <ul className="yeast-explanation__list">
          <li>
            <span>Method factor</span>
            <strong>{model.methodFactorText}</strong>
            <p>{model.methodDescription}</p>
          </li>
          <li>
            <span>Fresh yeast baseline</span>
            <strong>{model.freshYeastPercentText}</strong>
            <p>
              This is the fresh yeast percentage the model targets before converting to your
              selected yeast type.
            </p>
          </li>
          <li>
            <span>{model.selectedYeastLabel} yeast</span>
            <strong>{model.selectedYeastPercentText}</strong>
            <p>
              This is the baker&apos;s percentage used for the yeast type you selected in the
              form.
            </p>
          </li>
        </ul>
      </div>
    </details>
  )
}
