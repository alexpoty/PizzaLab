package com.pizzalab.backend.api.recipe.dto

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import java.time.Instant
import java.util.UUID

data class RecipeResponse(
    val id: UUID,
    val name: String,
    val formula: DoughCalculationRequest,
    val createdAt: Instant,
)
