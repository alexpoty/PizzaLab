import { describe, expect, it } from 'vitest'
import { createPrefermentDoughResult } from './doughResult'

describe('doughResult factory', () => {
  it('preserves explicit null preferment overrides', () => {
    const result = createPrefermentDoughResult({ preferment: null })

    expect(result.preferment).toBeNull()
  })

  it('keeps the default preferment block when no preferment override is provided', () => {
    const result = createPrefermentDoughResult()

    expect(result.preferment).toEqual({
      flourGrams: 276,
      waterGrams: 276,
      yeastGrams: 1.2,
    })
  })
})
