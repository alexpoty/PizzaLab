package com.pizzalab.backend.api.dough.dto

import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import jakarta.validation.constraints.DecimalMin

data class FermentationScheduleRequest(
    val mode: FermentationMode,

    @field:DecimalMin("0.0")
    val roomHours: Double? = null,

    @field:DecimalMin("1.0")
    val roomTemperatureCelsius: Double? = null,

    @field:DecimalMin("0.0")
    val coldHours: Double? = null,

    @field:DecimalMin("1.0")
    val coldTemperatureCelsius: Double? = null,
)
