// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultForm, defaultMetadata } from '../../data/doughDefaults'
import type { FormState } from '../../types/dough'
import { DoughForm } from '../DoughForm'
import { ResultsPanel } from './ResultsPanel'

afterEach(() => {
  cleanup()
})

describe('ResultsPanel', () => {
  it('keeps the fermentation timeline outside the live results region', () => {
    render(<ResultsPanelHarness />)

    const liveRegion = document.querySelector('.results-live-region')

    expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
    expect(liveRegion?.textContent).not.toContain('Timeline')
    expect(screen.getByText('Timeline')).toBeTruthy()
  })

  it('updates fermentation timeline immediately when form changes', async () => {
    const user = userEvent.setup()

    const { container } = render(<ResultsPanelHarness />)
    const resultsPanel = container.querySelector<HTMLElement>('.results-panel')

    if (!resultsPanel) {
      throw new Error('Missing results panel')
    }

    const results = within(resultsPanel)

    expect(results.getByText('Mix dough')).toBeTruthy()
    expect(results.getByText('Cold ferment')).toBeTruthy()
    expect(results.getByText('24h at 5C')).toBeTruthy()
    expect(results.getByText('30 Apr · 09:30 to 1 May · 09:30')).toBeTruthy()
    expect(results.queryByText('Final mix')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Manual' }))
    await user.click(screen.getByRole('button', { name: 'Poolish' }))

    setNumberField('Room hours h', '16')
    setNumberField('Cold hours h', '24')

    await waitFor(() => {
      expect(results.getByText('Mix poolish')).toBeTruthy()
      expect(results.getByText('Ferment poolish')).toBeTruthy()
      expect(results.getByText('Final mix')).toBeTruthy()
      expect(results.getByText('16h at 20C')).toBeTruthy()
      expect(results.getByText('24h at 5C')).toBeTruthy()
      expect(results.getByText('30 Apr · 09:30 to 1 May · 01:30')).toBeTruthy()
      expect(results.getByText('1 May · 01:30 to 2 May · 01:30')).toBeTruthy()
      expect(results.getAllByText('2 May · 01:30')).toHaveLength(2)
    })
  })
})

function ResultsPanelHarness() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const compatiblePresets = useMemo(
    () =>
      defaultMetadata.fermentationPresets.filter((preset) =>
        preset.compatibleDoughMethods.includes(form.doughMethod),
      ),
    [form.doughMethod],
  )
  const selectedPreset = form.fermentationSchedule
    ? undefined
    : compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
      compatiblePresets[0]

  return (
    <>
      <DoughForm
        metadata={defaultMetadata}
        form={form}
        setForm={setForm}
        compatiblePresets={compatiblePresets}
        selectedPreset={selectedPreset}
        error={null}
        isLoading={false}
        onSubmit={vi.fn()}
      />
      <ResultsPanel
        result={null}
        form={form}
        selectedPreset={selectedPreset}
        timelineStartedAt={new Date(2026, 3, 30, 9, 30)}
      />
    </>
  )
}

function setNumberField(name: string, value: string) {
  fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value } })
}
