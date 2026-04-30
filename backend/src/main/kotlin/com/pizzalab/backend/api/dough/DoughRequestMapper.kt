package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import com.pizzalab.backend.api.dough.dto.FermentationScheduleRequest
import com.pizzalab.backend.domain.model.dough.DoughFormula
import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationPreset
import com.pizzalab.backend.domain.model.fermentation.FermentationSchedule
import com.pizzalab.backend.domain.model.fermentation.definition

/**
 * Converts the public request shape into the domain formula used by the calculator.
 */
internal fun DoughCalculationRequest.toFormula(): DoughFormula =
    DoughFormula(
        pizzaCount = pizzaCount,
        doughBallWeightGrams = doughBallWeightGrams,
        hydrationPercent = hydrationPercent,
        saltPercent = saltPercent,
        yeastType = yeastType,
        doughMethod = doughMethod,
        fermentationSchedule = resolveFermentationSchedule(),
        prefermentFlourPercent = prefermentFlourPercent,
    )

/**
 * Uses an explicit schedule when supplied, otherwise expands the selected preset.
 */
private fun DoughCalculationRequest.resolveFermentationSchedule(): FermentationSchedule {
    if (fermentationSchedule != null) {
        return fermentationSchedule.toDomain()
    }

    return fermentationPreset?.toSchedule(
        doughMethod = doughMethod,
        roomTemperatureCelsius = roomTemperatureCelsius,
        coldTemperatureCelsius = coldTemperatureCelsius,
    ) ?: throw IllegalArgumentException("Either fermentationSchedule or fermentationPreset must be provided.")
}

/**
 * Maps the API schedule object to the validated domain schedule.
 */
private fun FermentationScheduleRequest.toDomain(): FermentationSchedule =
    ManualFermentationScheduleValidator.validate(this)
        .let {
            FermentationSchedule(
                mode = mode,
                roomHours = roomHours.orZero(),
                roomTemperatureCelsius = roomTemperatureCelsius.orDefaultRoomTemperature(),
                coldHours = coldHours.orZero(),
                coldTemperatureCelsius = coldTemperatureCelsius.orDefaultColdTemperature(),
            )
        }

private fun Double?.orZero(): Double = this ?: 0.0

private fun Double?.orDefaultRoomTemperature(): Double = this ?: 20.0

private fun Double?.orDefaultColdTemperature(): Double = this ?: 4.0

/**
 * Delegates preset expansion to the shared domain preset definition.
 */
private fun FermentationPreset.toSchedule(
    doughMethod: DoughMethod,
    roomTemperatureCelsius: Double?,
    coldTemperatureCelsius: Double?,
): FermentationSchedule =
    definition().toSchedule(
        preset = this,
        doughMethod = doughMethod,
        roomTemperatureCelsius = roomTemperatureCelsius,
        coldTemperatureCelsius = coldTemperatureCelsius,
    )
