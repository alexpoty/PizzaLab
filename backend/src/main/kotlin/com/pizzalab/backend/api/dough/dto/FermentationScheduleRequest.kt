package com.pizzalab.backend.api.dough.dto

import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import jakarta.validation.constraints.DecimalMin

data class FermentationScheduleRequest(
    val mode: FermentationMode,

    @field:DecimalMin("0.0")
    val roomHours: Double = 0.0,

    @field:DecimalMin("1.0")
    val roomTemperatureCelsius: Double = 20.0,

    @field:DecimalMin("0.0")
    val coldHours: Double = 0.0,

    @field:DecimalMin("1.0")
    val coldTemperatureCelsius: Double = 4.0,
)
