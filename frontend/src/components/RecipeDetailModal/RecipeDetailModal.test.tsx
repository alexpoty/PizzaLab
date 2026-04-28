// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defaultMetadata } from '../../data/doughDefaults'
import type {
  DoughCalculationResponse,
  FormState,
} from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { RecipeDetailModal } from './RecipeDetailModal'

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Poolish dough',
  createdAt: '2026-04-27T00:05:00Z',
  formula: {
    pizzaCount: 4,
    doughBallWeightGrams: 250,
    hydrationPercent: 68,
    saltPercent: 2.8,
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    fermentationPreset: 'ROOM_24H',
    roomTemperatureCelsius: 20,
    prefermentFlourPercent: 30,
  },
}

const result: DoughCalculationResponse = {
  flourGrams: 920,
  waterGrams: 634.8,
  saltGrams: 25.8,
  yeastGrams: 2.4,
  totalDoughWeightGrams: 1583,
  preferment: {
    flourGrams: 276,
    waterGrams: 276,
    yeastGrams: 1.2,
  },
  finalMix: {
    flourGrams: 644,
    waterGrams: 358.8,
    saltGrams: 25.8,
    yeastGrams: 1.2,
  },
  yeastCalculation: {
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    freshYeastPercent: 0.24,
    selectedYeastPercent: 0.08,
    freshYeastEquivalentGrams: 2.2,
    selectedYeastGrams: 0.7,
    prefermentYeastGrams: 0.35,
    finalMixYeastGrams: 0.35,
  },
}

describe('RecipeDetailModal', () => {
  it('renders view mode details and actions', () => {
    render(
      <RecipeDetailModalHarness
        mode="view"
        result={result}
        resultError={null}
      />,
    )

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit recipe' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy()
    expect(screen.getByText('Preferment')).toBeTruthy()
    expect(screen.getByText('Final mix')).toBeTruthy()
    expect(screen.getByText('POOLISH')).toBeTruthy()
  })

  it('renders edit mode form and fires save/cancel actions', async () => {
    const onSave = vi.fn()
    const onCancelEdit = vi.fn()

    render(
      <RecipeDetailModalHarness
        mode="edit"
        result={result}
        resultError={null}
        onSave={onSave}
        onCancelEdit={onCancelEdit}
      />,
    )

    expect(screen.getByRole('button', { name: 'Update recipe' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Preview dough' })).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Update recipe' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onCancelEdit).toHaveBeenCalledTimes(1)
  })
})

function RecipeDetailModalHarness({
  mode,
  result,
  resultError,
  onSave = vi.fn(),
  onCancelEdit = vi.fn(),
}: {
  mode: 'view' | 'edit' | 'duplicate'
  result: DoughCalculationResponse | null
  resultError: string | null
  onSave?: () => void
  onCancelEdit?: () => void
}) {
  const [form, setForm] = useState<FormState>({
    pizzaCount: 4,
    doughBallWeightGrams: 250,
    hydrationPercent: 68,
    saltPercent: 2.8,
    yeastType: 'INSTANT',
    doughMethod: 'POOLISH',
    fermentationPreset: 'ROOM_24H',
    fermentationSchedule: null,
    roomTemperatureCelsius: 20,
    coldTemperatureCelsius: 4,
    prefermentFlourPercent: 30,
  })

  const compatiblePresets = useMemo(
    () =>
      defaultMetadata.fermentationPresets.filter((preset) =>
        preset.compatibleDoughMethods.includes(form.doughMethod),
      ),
    [form.doughMethod],
  )

  const selectedPreset =
    compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
    compatiblePresets[0]

  return (
    <RecipeDetailModal
      recipe={recipe}
      result={result}
      mode={mode}
      recipeName={recipe.name}
      sourceRecipeName={null}
      isLoading={false}
      metadata={defaultMetadata}
      form={form}
      setForm={setForm}
      compatiblePresets={compatiblePresets}
      selectedPreset={selectedPreset}
      formError={null}
      resultError={resultError}
      onChangeName={vi.fn()}
      onEdit={vi.fn()}
      onDuplicate={vi.fn()}
      onPreview={vi.fn()}
      onSave={onSave}
      onDelete={vi.fn()}
      onCancelEdit={onCancelEdit}
      onClose={vi.fn()}
    />
  )
}
