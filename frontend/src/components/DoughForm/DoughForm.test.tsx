// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defaultForm, defaultMetadata } from '../../data/doughDefaults'
import type { FormState } from '../../types/dough'
import { DoughForm } from './DoughForm'

describe('DoughForm', () => {
  it('switches between preset and manual fermentation modes', async () => {
    render(<DoughFormHarness />)

    expect(screen.getByRole('button', { name: 'Preset' })).toBeTruthy()
    expect(screen.getByLabelText('Preset')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Manual' }))

    expect(screen.queryByLabelText('Preset')).toBeNull()
    expect(screen.getByRole('spinbutton', { name: 'Room hours h' })).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Cold hours h' })).toBeTruthy()

    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Room hours h' }))
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Room hours h' }), '12')
    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Room temp C' }))
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Room temp C' }), '21.5')
    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Cold hours h' }))
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Cold hours h' }), '18')
    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Fridge temp C' }))
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Fridge temp C' }), '4.5')

    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        fermentationPreset: 'COLD_24H',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 12,
          roomTemperatureCelsius: 21.5,
          coldHours: 18,
          coldTemperatureCelsius: 4.5,
        },
      })
    })

    await userEvent.click(screen.getByRole('button', { name: 'Poolish' }))

    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        doughMethod: 'POOLISH',
        fermentationPreset: 'ROOM_24H',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 12,
          coldHours: 18,
        },
      })
    })

    await userEvent.click(screen.getByRole('button', { name: 'Preset' }))

    expect(screen.getByLabelText('Preset')).toBeTruthy()
    expect(screen.queryByRole('spinbutton', { name: 'Room hours h' })).toBeNull()
    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        fermentationPreset: 'ROOM_24H',
        fermentationSchedule: null,
      })
    })
  })
})

function readFormState(): FormState {
  const snapshot = screen.getByTestId('form-state').textContent

  if (!snapshot) {
    throw new Error('Missing form state snapshot')
  }

  return JSON.parse(snapshot) as FormState
}

function DoughFormHarness() {
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
      <pre data-testid="form-state">{JSON.stringify(form)}</pre>
    </>
  )
}
