package com.pizzalab.backend.api.dough

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationPreset
import com.pizzalab.backend.domain.model.YeastType
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.Valid

data class DoughCalculationRequest(
    @field:Min(1)
    val pizzaCount: Int,

    @field:DecimalMin("1.0")
    val doughBallWeightGrams: Double,

    @field:DecimalMin("1.0")
    val hydrationPercent: Double,

    @field:DecimalMin("0.0")
    val saltPercent: Double,

    val yeastType: YeastType,

    val doughMethod: DoughMethod = DoughMethod.DIRECT,

    @field:Valid
    val fermentationSchedule: FermentationScheduleRequest? = null,

    val fermentationPreset: FermentationPreset? = null,

    @field:DecimalMin("1.0")
    val roomTemperatureCelsius: Double? = null,

    @field:DecimalMin("1.0")
    val coldTemperatureCelsius: Double? = null,

    @field:DecimalMin("0.0")
    val prefermentFlourPercent: Double? = null,
)
