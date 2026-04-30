// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defaultForm, defaultMetadata } from '../../data/doughDefaults'
import type { FormState } from '../../types/dough'
import { DoughForm } from '../DoughForm'
import { ResultsPanel } from './ResultsPanel'

describe('ResultsPanel', () => {
  it('updates fermentation timeline immediately when form changes', async () => {
    const user = userEvent.setup()

    render(<ResultsPanelHarness />)

    expect(screen.getByText('Mix dough')).toBeTruthy()
    expect(screen.getByText('Cold ferment')).toBeTruthy()
    expect(screen.getByText('24h at 5C')).toBeTruthy()
    expect(screen.getByText('30 Apr · 09:30 to 1 May · 09:30')).toBeTruthy()
    expect(screen.queryByText('Final mix')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Manual' }))
    await user.click(screen.getByRole('button', { name: 'Poolish' }))

    await user.clear(screen.getByRole('spinbutton', { name: 'Room hours h' }))
    await user.type(screen.getByRole('spinbutton', { name: 'Room hours h' }), '16')
    await user.clear(screen.getByRole('spinbutton', { name: 'Cold hours h' }))
    await user.type(screen.getByRole('spinbutton', { name: 'Cold hours h' }), '24')

    await waitFor(() => {
      expect(screen.getByText('Mix poolish')).toBeTruthy()
      expect(screen.getByText('Ferment poolish')).toBeTruthy()
      expect(screen.getByText('Final mix')).toBeTruthy()
      expect(screen.getByText('16h at 20C')).toBeTruthy()
      expect(screen.getByText('24h at 5C')).toBeTruthy()
      expect(screen.getByText('30 Apr · 09:30 to 1 May · 01:30')).toBeTruthy()
      expect(screen.getByText('1 May · 01:30 to 2 May · 01:30')).toBeTruthy()
      expect(screen.getAllByText('2 May · 01:30')).toHaveLength(2)
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
