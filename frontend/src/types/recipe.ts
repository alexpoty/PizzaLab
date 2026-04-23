import type { DoughCalculationRequest } from './dough'

export type Recipe = {
  id: string
  name: string
  formula: DoughCalculationRequest
  createdAt: string
}

export type CreateRecipeRequest = {
  name: string
  formula: DoughCalculationRequest
}
