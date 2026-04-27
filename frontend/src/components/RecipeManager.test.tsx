// @vitest-environment jsdom

import { useMemo, useState } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RecipeManager } from './RecipeManager'
import { buildCalculationRequest } from '../api/doughApi'
import { defaultMetadata } from '../data/doughDefaults'
import type {
  DoughCalculationRequest,
  DoughCalculationResponse,
  FormState,
} from '../types/dough'
import type { Recipe } from '../types/recipe'
import { applyRecipeFormulaToForm } from '../utils/recipeForm'
import {
  createRecipe,
  deleteRecipe,
  fetchRecipes,
  updateRecipe,
} from '../api/recipeApi'
import { calculateDough } from '../api/doughApi'

vi.mock('../api/recipeApi', () => ({
  fetchRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}))

vi.mock('../api/doughApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/doughApi')>()

  return {
    ...actual,
    calculateDough: vi.fn(),
  }
})

const originalFormula: DoughCalculationRequest = {
  pizzaCount: 4,
  doughBallWeightGrams: 250,
  hydrationPercent: 65,
  saltPercent: 2.8,
  yeastType: 'INSTANT',
  doughMethod: 'DIRECT',
  fermentationPreset: 'ROOM_24H',
  roomTemperatureCelsius: 20,
}

const editedFormula: DoughCalculationRequest = {
  pizzaCount: 4,
  doughBallWeightGrams: 250,
  hydrationPercent: 68,
  saltPercent: 2.8,
  yeastType: 'INSTANT',
  doughMethod: 'POOLISH',
  fermentationPreset: 'ROOM_24H',
  roomTemperatureCelsius: 20,
  prefermentFlourPercent: 30,
}

const calculationResult: DoughCalculationResponse = {
  flourGrams: 1000,
  waterGrams: 650,
  saltGrams: 28,
  yeastGrams: 1.5,
  totalDoughWeightGrams: 1679.5,
  preferment: null,
  finalMix: {
    flourGrams: 1000,
    waterGrams: 650,
    saltGrams: 28,
    yeastGrams: 1.5,
  },
  yeastCalculation: {
    yeastType: 'INSTANT',
    doughMethod: 'DIRECT',
    roomEffectHours: 24,
    coldEffectHours: 0,
    effectiveFermentationHours: 24,
    freshYeastPercent: 0.12,
    selectedYeastPercent: 0.04,
    freshYeastEquivalentGrams: 1.2,
    selectedYeastGrams: 0.4,
    prefermentYeastGrams: 0,
    finalMixYeastGrams: 0.4,
  },
}

describe('RecipeManager', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('opens recipes on click and edits or duplicates them from the modal', async () => {
    const initialRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Original dough',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const updatedRecipe: Recipe = {
      ...initialRecipe,
      name: 'Original dough v2',
      formula: editedFormula,
    }
    const duplicatedRecipe: Recipe = {
      id: 'recipe-2',
      name: 'Original dough v2 copy',
      formula: editedFormula,
      createdAt: '2026-04-27T00:05:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([initialRecipe])
    vi.mocked(updateRecipe).mockResolvedValue(updatedRecipe)
    vi.mocked(createRecipe).mockResolvedValue(duplicatedRecipe)
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    render(<RecipeManagerHarness />)

    expect(await screen.findByText('Original dough')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Load' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await userEvent.click(screen.getByText('Original dough'))

    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...originalFormula, fermentationSchedule: null })
    })
    expect(await screen.findByRole('button', { name: 'Edit recipe' })).toBeTruthy()
    expect(screen.getByText(/Click Edit recipe to change the loaded formula/)).toBeTruthy()
    expect(calculateDough).toHaveBeenNthCalledWith(1, originalFormula)

    await userEvent.click(screen.getByRole('button', { name: 'Edit recipe' }))
    await userEvent.clear(screen.getByDisplayValue('Original dough'))
    await userEvent.type(screen.getByRole('textbox', { name: 'Recipe name' }), 'Original dough v2')
    expect(screen.getByRole('button', { name: 'Preview dough' })).toBeTruthy()
    expect(screen.getByText(/Change hydration, method, temperatures, and the rest of the formula below/)).toBeTruthy()
    const hydrationInput = screen.getByDisplayValue('65')
    await userEvent.clear(hydrationInput)
    await userEvent.type(hydrationInput, '68')
    await userEvent.click(screen.getByRole('button', { name: 'Poolish' }))
    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...editedFormula, fermentationSchedule: null })
    })
    await userEvent.click(screen.getByRole('button', { name: 'Update recipe' }))

    expect(updateRecipe).toHaveBeenCalledWith('recipe-1', {
      name: 'Original dough v2',
      formula: expect.objectContaining({
        hydrationPercent: 68,
        doughMethod: 'POOLISH',
        fermentationPreset: 'ROOM_24H',
        prefermentFlourPercent: 30,
      }),
    })
    expect((await screen.findAllByText('Original dough v2')).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...editedFormula, fermentationSchedule: null })
    })
    expect(calculateDough).toHaveBeenNthCalledWith(2, editedFormula)

    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    expect(createRecipe).not.toHaveBeenCalled()
    expect(screen.getByDisplayValue('Original dough v2 copy')).toBeTruthy()
    expect(
      screen.getByText(/Copy draft from "Original dough v2" is editable here/),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save copy' })).toBeTruthy()
    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...editedFormula, fermentationSchedule: null })
    })

    await userEvent.click(screen.getByRole('button', { name: 'Save copy' }))

    expect(createRecipe).toHaveBeenCalledWith({
      name: 'Original dough v2 copy',
      formula: expect.objectContaining({
        hydrationPercent: 68,
        doughMethod: 'POOLISH',
        fermentationPreset: 'ROOM_24H',
        prefermentFlourPercent: 30,
      }),
    })
    expect((await screen.findAllByText('Original dough v2 copy')).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...editedFormula, fermentationSchedule: null })
    })
    expect(calculateDough).toHaveBeenNthCalledWith(3, editedFormula)
  })

  it('restores the loaded recipe formula when modal edits are canceled', async () => {
    const initialRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Original dough',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([initialRecipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    render(<RecipeManagerHarness />)

    await userEvent.click(await screen.findByText('Original dough'))
    await screen.findByRole('button', { name: 'Edit recipe' })

    await userEvent.click(screen.getByRole('button', { name: 'Edit recipe' }))
    const hydrationInput = screen.getByDisplayValue('65')
    await userEvent.clear(hydrationInput)
    await userEvent.type(hydrationInput, '68')
    await userEvent.click(screen.getByRole('button', { name: 'Poolish' }))

    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...editedFormula, fermentationSchedule: null })
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => {
      expect(readCurrentFormula()).toEqual({ ...originalFormula, fermentationSchedule: null })
    })
  })

  it('keeps delete available when recipe preview calculation fails', async () => {
    const failingRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Broken preview',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([failingRecipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockRejectedValue(new Error('Recipe calculation failed'))

    render(<RecipeManagerHarness />)

    await userEvent.click(await screen.findByText('Broken preview'))
    expect(await screen.findByText('Recipe calculation failed')).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Preview unavailable for this saved formula.')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Delete Broken preview' }))

    expect(deleteRecipe).toHaveBeenCalledWith('recipe-1')
    expect(screen.queryByText('Broken preview')).toBeNull()
  })

  it('does not open a recipe when delete is triggered from the keyboard', async () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Keyboard delete',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([recipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockResolvedValue(calculationResult)

    render(<RecipeManagerHarness />)

    const deleteButton = await screen.findByRole('button', { name: 'Delete Keyboard delete' })
    deleteButton.focus()
    await userEvent.keyboard('{Enter}')

    expect(deleteRecipe).toHaveBeenCalledWith('recipe-1')
    expect(calculateDough).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows preview failures inside the modal form', async () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Preview failure',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([recipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough)
      .mockResolvedValueOnce(calculationResult)
      .mockRejectedValueOnce(new Error('Preview failed'))

    render(<RecipeManagerHarness />)

    await userEvent.click(await screen.findByText('Preview failure'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit recipe' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview dough' }))

    expect(await screen.findByText('Preview failed')).toBeTruthy()
    expect(screen.getByText('Preview unavailable for this saved formula.')).toBeTruthy()
    expect(screen.queryByText('Flour 1000.0g')).toBeNull()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('shows save failures inside the modal form', async () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Save failure',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }

    vi.mocked(fetchRecipes).mockResolvedValue([recipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(calculateDough).mockResolvedValue(calculationResult)
    vi.mocked(updateRecipe).mockRejectedValue(new Error('Update failed'))

    render(<RecipeManagerHarness />)

    await userEvent.click(await screen.findByText('Save failure'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit recipe' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update recipe' }))

    expect(await screen.findByText('Update failed')).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('clears stale preview totals when recalculation fails after saving from the modal', async () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Recalc failure',
      formula: originalFormula,
      createdAt: '2026-04-27T00:00:00Z',
    }
    const updatedRecipe: Recipe = {
      ...recipe,
      name: 'Recalc failure v2',
      formula: editedFormula,
    }

    vi.mocked(fetchRecipes).mockResolvedValue([recipe])
    vi.mocked(deleteRecipe).mockResolvedValue(undefined)
    vi.mocked(updateRecipe).mockResolvedValue(updatedRecipe)
    vi.mocked(calculateDough)
      .mockResolvedValueOnce(calculationResult)
      .mockRejectedValueOnce(new Error('Recalculation failed'))

    render(<RecipeManagerHarness />)

    await userEvent.click(await screen.findByText('Recalc failure'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit recipe' }))
    await userEvent.clear(screen.getByDisplayValue('Recalc failure'))
    await userEvent.type(screen.getByRole('textbox', { name: 'Recipe name' }), 'Recalc failure v2')
    await userEvent.click(screen.getByRole('button', { name: 'Update recipe' }))

    expect(await screen.findByText('Recalculation failed')).toBeTruthy()
    expect(screen.getByText('Preview unavailable for this saved formula.')).toBeTruthy()
    expect(screen.queryByText('Flour 1000.0g')).toBeNull()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})

function readCurrentFormula() {
  return JSON.parse(screen.getByTestId('current-formula').textContent ?? 'null')
}

function RecipeManagerHarness() {
  const [form, setForm] = useState<FormState>({
    pizzaCount: 2,
    doughBallWeightGrams: 230,
    hydrationPercent: 62,
    saltPercent: 2.9,
    yeastType: 'ACTIVE_DRY',
    doughMethod: 'DIRECT',
    fermentationPreset: 'COLD_24H',
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
    form.fermentationSchedule
      ? undefined
      : compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
        compatiblePresets[0]
  const formula = buildCalculationRequest(form, selectedPreset)

  return (
    <>
      <output data-testid="current-formula">{JSON.stringify(formula)}</output>
      <RecipeManager
        metadata={defaultMetadata}
        form={form}
        setForm={setForm}
        compatiblePresets={compatiblePresets}
        selectedPreset={selectedPreset}
        formula={formula}
        onLoadRecipe={(loadedFormula) =>
          setForm((current) => applyRecipeFormulaToForm(current, loadedFormula))
        }
      />
    </>
  )
}
