package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.YeastType
import kotlin.math.max
import kotlin.math.pow

class YeastCalculator {
    fun calculateYeastPercent(
        schedule: FermentationSchedule,
        yeastType: YeastType,
        doughMethod: DoughMethod,
    ): Double {
        val roomEffect = schedule.roomHours * temperatureFactor(schedule.roomTemperatureCelsius, 20.0)
        val coldEffect = schedule.coldHours * temperatureFactor(schedule.coldTemperatureCelsius, 4.0) * 0.12
        val effectiveHours = max(1.0, roomEffect + coldEffect)

        val methodFactor = when (doughMethod) {
            DoughMethod.DIRECT -> 1.0
            DoughMethod.POOLISH -> 0.65
            DoughMethod.BIGA -> 0.55
        }

        val instantYeastPercent = (0.18 * 8.0 / effectiveHours) * methodFactor
        return instantYeastPercent * yeastType.instantYeastRatio
    }

    private fun temperatureFactor(actual: Double, base: Double): Double {
        return 2.0.pow((actual - base) / 10.0)
    }
}
