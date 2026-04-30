package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.FermentationScheduleRequest
import com.pizzalab.backend.domain.model.fermentation.FermentationMode

internal object ManualFermentationScheduleValidator {
    fun validate(schedule: FermentationScheduleRequest) {
        when (schedule.mode) {
            FermentationMode.ROOM -> schedule.requireStage(
                hours = schedule.roomHours,
                temperature = schedule.roomTemperatureCelsius,
                stage = "room",
            )

            FermentationMode.COLD -> schedule.requireStage(
                hours = schedule.coldHours,
                temperature = schedule.coldTemperatureCelsius,
                stage = "cold",
            )

            FermentationMode.MIXED -> {
                schedule.requireStage(
                    hours = schedule.roomHours,
                    temperature = schedule.roomTemperatureCelsius,
                    stage = "room",
                )
                schedule.requireStage(
                    hours = schedule.coldHours,
                    temperature = schedule.coldTemperatureCelsius,
                    stage = "cold",
                )
            }
        }
    }

    private fun FermentationScheduleRequest.requireStage(
        hours: Double?,
        temperature: Double?,
        stage: String,
    ) {
        val modeName = mode.name

        require(hours.orZero() > 0.0) {
            "$modeName mode requires ${stage}Hours > 0."
        }
        require(temperature != null) {
            "$modeName mode requires ${stage}TemperatureCelsius."
        }
    }

    private fun Double?.orZero(): Double = this ?: 0.0
}
