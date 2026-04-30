package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import com.pizzalab.backend.api.dough.dto.FermentationScheduleRequest
import com.pizzalab.backend.domain.model.dough.DoughFormula
import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationMode
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
    validateManualSchedule()
        .let {
            FermentationSchedule(
                mode = mode,
                roomHours = roomHours ?: 0.0,
                roomTemperatureCelsius = roomTemperatureCelsius ?: 20.0,
                coldHours = coldHours ?: 0.0,
                coldTemperatureCelsius = coldTemperatureCelsius ?: 4.0,
            )
        }

private fun FermentationScheduleRequest.validateManualSchedule() {
    when (mode) {
        FermentationMode.ROOM -> {
            require((roomHours ?: 0.0) > 0.0) {
                "ROOM mode requires roomHours > 0."
            }
            require(roomTemperatureCelsius != null) {
                "ROOM mode requires roomTemperatureCelsius."
            }
        }

        FermentationMode.COLD -> {
            require((coldHours ?: 0.0) > 0.0) {
                "COLD mode requires coldHours > 0."
            }
            require(coldTemperatureCelsius != null) {
                "COLD mode requires coldTemperatureCelsius."
            }
        }

        FermentationMode.MIXED -> {
            require((roomHours ?: 0.0) > 0.0) {
                "MIXED mode requires roomHours > 0."
            }
            require(roomTemperatureCelsius != null) {
                "MIXED mode requires roomTemperatureCelsius."
            }
            require((coldHours ?: 0.0) > 0.0) {
                "MIXED mode requires coldHours > 0."
            }
            require(coldTemperatureCelsius != null) {
                "MIXED mode requires coldTemperatureCelsius."
            }
        }
    }
}

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
