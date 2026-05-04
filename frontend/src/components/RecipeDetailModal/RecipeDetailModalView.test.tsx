// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createPrefermentDoughResult } from '../../test/factories/doughResult'
import {
  createManualRecipe,
  RecipeDetailModalHarness,
} from './RecipeDetailModal.test-support'

afterEach(() => {
  cleanup()
})

describe('RecipeDetailModal view mode', () => {
  it('renders recipe details and read-only actions', () => {
    render(
      <RecipeDetailModalHarness
        mode="view"
        result={createPrefermentDoughResult()}
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

  it('renders manual fermentation details for manual formulas', () => {
    render(
      <RecipeDetailModalHarness
        mode="view"
        recipeOverride={createManualRecipe()}
        result={createPrefermentDoughResult()}
        resultError={null}
      />,
    )

    expect(screen.getByText('Manual')).toBeTruthy()
    expect(screen.getByText('12h room @ 21.5C, 18h cold @ 4.5C')).toBeTruthy()
  })
})
