// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { createDirectDoughResult } from '../../test/factories/doughResult'
import { CalculatedResults } from './CalculatedResults'

afterEach(() => {
  cleanup()
})

describe('CalculatedResults', () => {
  it('renders summary chips and expandable yeast explanation from the same calculation model', async () => {
    const user = userEvent.setup()
    const result = createDirectDoughResult({
      yeastCalculation: {
        doughMethod: 'POOLISH',
        roomEffectHours: 18,
        coldEffectHours: 6,
        effectiveFermentationHours: 24,
        methodFactor: 0.75,
        freshYeastPercent: 0.12,
        selectedYeastPercent: 0.04,
      },
    })

    render(<CalculatedResults result={result} />)

    const details = document.querySelector('.yeast-explanation')

    expect(screen.getByText('INSTANT')).toBeTruthy()
    expect(screen.getByText('0.04% selected')).toBeTruthy()
    expect(screen.getByText('0.12% fresh equivalent')).toBeTruthy()
    expect(details?.hasAttribute('open')).toBe(false)

    await user.click(screen.getByText('Why this yeast amount?'))

    expect(details?.hasAttribute('open')).toBe(true)
    expect(screen.getAllByText('24 effective hours')).toHaveLength(2)
    expect(screen.getByText('Method factor')).toBeTruthy()
    expect(screen.getByText('0.75x')).toBeTruthy()
    expect(screen.getByText('Poolish uses a 0.75x factor because the preferment develops extra strength over time.')).toBeTruthy()
    expect(screen.getByText('Instant yeast')).toBeTruthy()
    expect(screen.getByText(/The calculator converts your schedule into/)).toBeTruthy()
  })

  it('preserves nonzero yeast percentage precision for low-yeast cases', () => {
    const result = createDirectDoughResult({
      yeastCalculation: {
        freshYeastPercent: 0.0123,
        selectedYeastPercent: 0.0041,
      },
    })

    render(<CalculatedResults result={result} />)

    expect(screen.getByText('0.0041% selected')).toBeTruthy()
    expect(screen.getByText('0.0123% fresh equivalent')).toBeTruthy()
  })
})
