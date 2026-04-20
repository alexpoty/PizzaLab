package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.YeastCalculation
import com.pizzalab.backend.domain.model.YeastCalculationDetails
import com.pizzalab.backend.domain.model.YeastType
import kotlin.math.max
import kotlin.math.pow

class YeastCalculator {
    fun calculateYeastPercent(
        schedule: FermentationSchedule,
        yeastType: YeastType,
        doughMethod: DoughMethod,
        hydrationPercent: Double,
        flourGrams: Double,
    ): YeastCalculation {
        val roomEffect = schedule.roomHours * temperatureFactor(schedule.roomTemperatureCelsius, ReferenceRoomTemperatureCelsius)
        val coldEffect = schedule.coldHours *
            ColdRetardationFactor *
            temperatureFactor(schedule.coldTemperatureCelsius, ReferenceColdTemperatureCelsius)
        val effectiveHours = max(1.0, roomEffect + coldEffect)

        val methodFactor = when (doughMethod) {
            DoughMethod.DIRECT -> 1.0
            DoughMethod.POOLISH -> 0.75
            DoughMethod.BIGA -> 0.65
        }

        val minFreshYeastPercent = minFreshYeastPercent(hydrationPercent)
        val maxFreshYeastPercent = maxFreshYeastPercent(hydrationPercent)
        val freshYeastPercentBeforeMethodFactor = (ReferenceFreshYeastPercent * ReferenceRoomHours / effectiveHours)
            .coerceIn(
                minimumValue = minFreshYeastPercent,
                maximumValue = maxFreshYeastPercent,
            )
        val freshYeastPercent = freshYeastPercentBeforeMethodFactor * methodFactor
        val selectedYeastPercent = freshYeastPercent / yeastType.freshYeastRatio
        val selectedYeastGrams = flourGrams * selectedYeastPercent / 100.0
        val freshYeastEquivalentGrams = flourGrams * freshYeastPercent / 100.0

        return YeastCalculation(
            selectedYeastPercent = selectedYeastPercent,
            details = YeastCalculationDetails(
                yeastType = yeastType,
                doughMethod = doughMethod,
                roomEffectHours = roomEffect,
                coldEffectHours = coldEffect,
                effectiveFermentationHours = effectiveHours,
                methodFactor = methodFactor,
                minFreshYeastPercent = minFreshYeastPercent,
                maxFreshYeastPercent = maxFreshYeastPercent,
                freshYeastPercentBeforeMethodFactor = freshYeastPercentBeforeMethodFactor,
                freshYeastPercent = freshYeastPercent,
                selectedYeastPercent = selectedYeastPercent,
                freshYeastEquivalentGrams = freshYeastEquivalentGrams,
                selectedYeastGrams = selectedYeastGrams,
            ),
        )
    }

    private fun temperatureFactor(actual: Double, base: Double): Double =
        2.0.pow((actual - base) / YeastActivityTemperatureStepCelsius)

    private fun minFreshYeastPercent(hydrationPercent: Double): Double =
        freshYeastPercentForWaterLiter(MinFreshYeastGramsPerWaterLiter, hydrationPercent)

    private fun maxFreshYeastPercent(hydrationPercent: Double): Double =
        freshYeastPercentForWaterLiter(MaxFreshYeastGramsPerWaterLiter, hydrationPercent)

    private fun freshYeastPercentForWaterLiter(yeastGrams: Double, hydrationPercent: Double): Double {
        val flourGramsPerWaterLiter = 1000.0 / (hydrationPercent / 100.0)
        return yeastGrams / flourGramsPerWaterLiter * 100.0
    }

    private companion object {
        const val ReferenceFreshYeastPercent = 3.0 / 1750.0 * 100.0
        const val ReferenceRoomHours = 8.0
        const val ReferenceRoomTemperatureCelsius = 25.0
        const val ReferenceColdTemperatureCelsius = 4.0
        const val YeastActivityTemperatureStepCelsius = 10.0
        const val ColdRetardationFactor = 0.24
        const val MinFreshYeastGramsPerWaterLiter = 0.1
        const val MaxFreshYeastGramsPerWaterLiter = 3.0
    }
}
