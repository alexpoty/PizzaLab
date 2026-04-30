// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultForm, defaultMetadata } from '../../data/doughDefaults'
import type { FormState } from '../../types/dough'
import { DoughForm } from './DoughForm'

afterEach(() => {
  cleanup()
})

describe('DoughForm', () => {
  it('switches between preset and manual fermentation modes', async () => {
    render(<DoughFormHarness />)

    expect(screen.getByRole('button', { name: 'Preset' })).toBeTruthy()
    expect(screen.getByLabelText('Preset')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Manual' }))

    expect(screen.queryByLabelText('Preset')).toBeNull()
    expect(screen.getByRole('spinbutton', { name: 'Room hours h' })).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Cold hours h' })).toBeTruthy()

    setNumberField('Room hours h', '12')
    setNumberField('Room temp C', '21.5')
    setNumberField('Cold hours h', '18')
    setNumberField('Fridge temp C', '4.5')

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
        fermentationMode: 'PRESET',
        fermentationPreset: 'ROOM_24H',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 12,
          roomTemperatureCelsius: 21.5,
          coldHours: 18,
          coldTemperatureCelsius: 4.5,
        },
      })
    })

    await userEvent.click(screen.getByRole('button', { name: 'Manual' }))

    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        fermentationMode: 'MANUAL',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 12,
          roomTemperatureCelsius: 21.5,
          coldHours: 18,
          coldTemperatureCelsius: 4.5,
        },
      })
    })
  })

  it('normalizes cold-only manual schedule when switching to poolish', async () => {
    render(
      <DoughFormHarness
        initialForm={{
          ...defaultForm,
          doughMethod: 'DIRECT',
          fermentationMode: 'MANUAL',
          fermentationSchedule: {
            mode: 'COLD',
            roomHours: 0,
            roomTemperatureCelsius: 20,
            coldHours: 24,
            coldTemperatureCelsius: 5,
          },
        }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Poolish' }))

    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        doughMethod: 'POOLISH',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 1,
          coldHours: 24,
        },
      })
    })
  })

  it('prevents cold-only manual schedule for preferment methods while editing', async () => {
    render(
      <DoughFormHarness
        initialForm={{
          ...defaultForm,
          doughMethod: 'POOLISH',
          fermentationMode: 'MANUAL',
          fermentationSchedule: {
            mode: 'MIXED',
            roomHours: 12,
            roomTemperatureCelsius: 20,
            coldHours: 24,
            coldTemperatureCelsius: 5,
          },
        }}
      />,
    )

    setNumberField('Room hours h', '0')

    await waitFor(() => {
      expect(readFormState()).toMatchObject({
        doughMethod: 'POOLISH',
        fermentationSchedule: {
          mode: 'MIXED',
          roomHours: 1,
          coldHours: 24,
        },
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

function setNumberField(name: string, value: string) {
  fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value } })
}

function DoughFormHarness({ initialForm = defaultForm }: { initialForm?: FormState }) {
  const [form, setForm] = useState<FormState>(initialForm)
  const compatiblePresets = useMemo(
    () =>
      defaultMetadata.fermentationPresets.filter((preset) =>
        preset.compatibleDoughMethods.includes(form.doughMethod),
      ),
    [form.doughMethod],
  )
  const selectedPreset =
    form.fermentationMode === 'MANUAL'
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
