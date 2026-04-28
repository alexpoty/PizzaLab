package com.pizzalab.backend.api.recipe.dto

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateRecipeRequest(
    @field:NotBlank
    @field:Size(max = 120)
    val name: String,

    @field:Valid
    val formula: DoughCalculationRequest,
)
