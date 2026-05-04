// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DoughResultBreakdown } from './DoughResultBreakdown'
import { createDirectDoughResult, createPrefermentDoughResult } from '../../test/factories/doughResult'

const resultWithPreferment = createPrefermentDoughResult()

const directResult = createDirectDoughResult()

afterEach(() => {
  cleanup()
})

describe('DoughResultBreakdown', () => {
  it('renders total ingredients and both mix blocks for preferment dough', () => {
    render(<DoughResultBreakdown result={resultWithPreferment} layout="modal" />)

    expect(screen.getByText('Preferment')).toBeTruthy()
    expect(screen.getByText('Final mix')).toBeTruthy()
    expect(screen.getByText('920.0g')).toBeTruthy()
    expect(screen.getAllByText('276.0g').length).toBeGreaterThan(1)
    expect(screen.getByText('358.8g')).toBeTruthy()
  })

  it('renders only final mix block for direct dough', () => {
    render(<DoughResultBreakdown result={directResult} />)

    expect(screen.queryByRole('heading', { name: 'Preferment' })).toBeNull()
    expect(screen.getByText('Final mix')).toBeTruthy()
    expect(screen.getAllByText('1000.0g').length).toBeGreaterThan(1)
  })
})
