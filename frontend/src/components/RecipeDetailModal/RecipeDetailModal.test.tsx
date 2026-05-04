// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createPrefermentDoughResult } from '../../test/factories/doughResult'
import { RecipeDetailModalHarness } from './RecipeDetailModal.test-support'

describe('RecipeDetailModal', () => {
  it('renders edit mode form and fires save/cancel actions', async () => {
    const onSave = vi.fn()
    const onCancelEdit = vi.fn()

    render(
      <RecipeDetailModalHarness
        mode="edit"
        result={createPrefermentDoughResult()}
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
