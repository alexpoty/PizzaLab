import { useMemo, useState } from 'react'
import { vi } from 'vitest'
import { defaultMetadata } from '../../data/doughDefaults'
import type { DoughCalculationResponse, FormState } from '../../types/dough'
import type { Recipe } from '../../types/recipe'
import { RecipeDetailModal } from './RecipeDetailModal'

export const defaultRecipe: Recipe = {
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

export function createManualRecipe(): Recipe {
  return {
    id: 'recipe-manual',
    name: 'Manual dough',
    createdAt: '2026-04-27T00:10:00Z',
    formula: {
      pizzaCount: 4,
      doughBallWeightGrams: 250,
      hydrationPercent: 65,
      saltPercent: 2.8,
      yeastType: 'INSTANT',
      doughMethod: 'DIRECT',
      fermentationPreset: null,
      fermentationSchedule: {
        mode: 'MIXED',
        roomHours: 12,
        roomTemperatureCelsius: 21.5,
        coldHours: 18,
        coldTemperatureCelsius: 4.5,
      },
    },
  }
}

export function RecipeDetailModalHarness({
  mode,
  recipeOverride,
  result,
  resultError,
  onSave = vi.fn(),
  onCancelEdit = vi.fn(),
}: {
  mode: 'view' | 'edit' | 'duplicate'
  recipeOverride?: Recipe
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
    fermentationMode: 'PRESET',
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
    form.fermentationMode === 'MANUAL'
      ? undefined
      : compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
        compatiblePresets[0]

  return (
    <RecipeDetailModal
      recipe={recipeOverride ?? defaultRecipe}
      result={result}
      mode={mode}
      recipeName={(recipeOverride ?? defaultRecipe).name}
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
