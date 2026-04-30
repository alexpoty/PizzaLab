// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecipeListItem } from './RecipeListItem'
import type { Recipe } from '../../types/recipe'

describe('RecipeListItem', () => {
  it('renders manual fermentation details for manual recipes', () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Manual dough',
      createdAt: '2026-04-27T00:10:00Z',
      formula: {
        pizzaCount: 4,
        doughBallWeightGrams: 250,
        hydrationPercent: 66,
        saltPercent: 2.9,
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

    render(
      <RecipeListItem
        recipe={recipe}
        isActive={false}
        isCompared={false}
        isDisabled={false}
        onSelect={vi.fn()}
        onToggleCompare={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Manual dough')).toBeTruthy()
    expect(screen.getByText('Manual · 12h room @ 21.5C, 18h cold @ 4.5C')).toBeTruthy()
  })
})
