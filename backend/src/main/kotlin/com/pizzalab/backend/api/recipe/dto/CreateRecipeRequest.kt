package com.pizzalab.backend.api.recipe.dto

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank

data class CreateRecipeRequest(
    @field:NotBlank
    val name: String,

    @field:Valid
    val formula: DoughCalculationRequest,
)
