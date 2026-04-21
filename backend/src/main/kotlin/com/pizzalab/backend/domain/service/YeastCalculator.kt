package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import com.pizzalab.backend.domain.model.fermentation.FermentationSchedule
import com.pizzalab.backend.domain.model.yeast.YeastCalculation
import com.pizzalab.backend.domain.model.yeast.YeastCalculationDetails
import com.pizzalab.backend.domain.model.yeast.YeastType
import kotlin.math.max
import kotlin.math.pow

class YeastCalculator {
    /**
     * Estimates yeast percentage for the selected method, temperature, and fermentation duration.
     */
    fun calculateYeastPercent(
        schedule: FermentationSchedule,
        yeastType: YeastType,
        doughMethod: DoughMethod,
        hydrationPercent: Double,
        flourGrams: Double,
    ): YeastCalculation {
        return if (doughMethod == DoughMethod.DIRECT && schedule.mode == FermentationMode.COLD) {
            calculateDirectColdYeast(
                schedule = schedule,
                yeastType = yeastType,
                flourGrams = flourGrams,
            )
        } else {
            calculateStandardYeast(
                schedule = schedule,
                yeastType = yeastType,
                doughMethod = doughMethod,
                hydrationPercent = hydrationPercent,
                flourGrams = flourGrams,
            )
        }
    }

    /**
     * Calculates yeast for room, mixed, and preferment schedules using effective fermentation time.
     */
    private fun calculateStandardYeast(
        schedule: FermentationSchedule,
        yeastType: YeastType,
        doughMethod: DoughMethod,
        hydrationPercent: Double,
        flourGrams: Double,
    ): YeastCalculation {
        val fermentationEffect = standardFermentationEffect(schedule)
        val methodFactor = methodFactor(doughMethod)
        val freshYeastPercent = standardFreshYeastPercent(
            hydrationPercent = hydrationPercent,
            effectiveHours = fermentationEffect.effectiveHours,
            methodFactor = methodFactor,
        )
        val yeastAmounts = yeastAmounts(
            flourGrams = flourGrams,
            freshYeastPercent = freshYeastPercent.afterMethodFactor,
            yeastType = yeastType,
        )

        return YeastCalculation(
            selectedYeastPercent = yeastAmounts.selectedYeastPercent,
            details = YeastCalculationDetails(
                yeastType = yeastType,
                doughMethod = doughMethod,
                roomEffectHours = fermentationEffect.roomHours,
                coldEffectHours = fermentationEffect.coldHours,
                effectiveFermentationHours = fermentationEffect.effectiveHours,
                methodFactor = methodFactor,
                minFreshYeastPercent = freshYeastPercent.minimum,
                maxFreshYeastPercent = freshYeastPercent.maximum,
                freshYeastPercentBeforeMethodFactor = freshYeastPercent.beforeMethodFactor,
                freshYeastPercent = freshYeastPercent.afterMethodFactor,
                selectedYeastPercent = yeastAmounts.selectedYeastPercent,
                freshYeastEquivalentGrams = yeastAmounts.freshYeastEquivalentGrams,
                selectedYeastGrams = yeastAmounts.selectedYeastGrams,
                prefermentYeastGrams = 0.0,
                finalMixYeastGrams = yeastAmounts.selectedYeastGrams,
            ),
        )
    }

    /**
     * Converts real room/cold hours into yeast activity hours using temperature multipliers.
     */
    private fun standardFermentationEffect(schedule: FermentationSchedule): FermentationEffect {
        val roomHours = schedule.roomHours * temperatureFactor(
            actual = schedule.roomTemperatureCelsius,
            base = ReferenceRoomTemperatureCelsius,
        )
        val coldHours = schedule.coldHours *
            ColdRetardationFactor *
            temperatureFactor(
                actual = schedule.coldTemperatureCelsius,
                base = ReferenceColdTemperatureCelsius,
            )

        return FermentationEffect(
            roomHours = roomHours,
            coldHours = coldHours,
            effectiveHours = max(1.0, roomHours + coldHours),
        )
    }

    /**
     * Computes fresh yeast percentage and clamps it to hydration-based practical limits.
     */
    private fun standardFreshYeastPercent(
        hydrationPercent: Double,
        effectiveHours: Double,
        methodFactor: Double,
    ): FreshYeastPercent {
        val minimum = minFreshYeastPercent(hydrationPercent)
        val maximum = maxFreshYeastPercent(hydrationPercent)
        val beforeMethodFactor = (ReferenceFreshYeastPercent * ReferenceRoomHours / effectiveHours)
            .coerceIn(
                minimumValue = minimum,
                maximumValue = maximum,
            )

        return FreshYeastPercent(
            minimum = minimum,
            maximum = maximum,
            beforeMethodFactor = beforeMethodFactor,
            afterMethodFactor = beforeMethodFactor * methodFactor,
        )
    }

    /**
     * Uses a separate calibrated formula for direct dough fermented only in cold storage.
     */
    private fun calculateDirectColdYeast(
        schedule: FermentationSchedule,
        yeastType: YeastType,
        flourGrams: Double,
    ): YeastCalculation {
        val coldEffectHours = directColdEffectHours(schedule)
        val freshYeastPercent = directColdFreshYeastPercent(schedule)
        val yeastAmounts = yeastAmounts(
            flourGrams = flourGrams,
            freshYeastPercent = freshYeastPercent,
            yeastType = yeastType,
        )

        return YeastCalculation(
            selectedYeastPercent = yeastAmounts.selectedYeastPercent,
            details = YeastCalculationDetails(
                yeastType = yeastType,
                doughMethod = DoughMethod.DIRECT,
                roomEffectHours = 0.0,
                coldEffectHours = coldEffectHours,
                effectiveFermentationHours = coldEffectHours,
                methodFactor = 1.0,
                minFreshYeastPercent = DirectColdFreshYeastPercentAt48Hours,
                maxFreshYeastPercent = DirectColdFreshYeastPercentAt24Hours,
                freshYeastPercentBeforeMethodFactor = freshYeastPercent,
                freshYeastPercent = freshYeastPercent,
                selectedYeastPercent = yeastAmounts.selectedYeastPercent,
                freshYeastEquivalentGrams = yeastAmounts.freshYeastEquivalentGrams,
                selectedYeastGrams = yeastAmounts.selectedYeastGrams,
                prefermentYeastGrams = 0.0,
                finalMixYeastGrams = yeastAmounts.selectedYeastGrams,
            ),
        )
    }

    /**
     * Converts direct-cold fermentation time into effective hours at the selected fridge temperature.
     */
    private fun directColdEffectHours(schedule: FermentationSchedule): Double =
        schedule.coldHours * temperatureFactor(
            actual = schedule.coldTemperatureCelsius,
            base = DirectColdReferenceTemperatureCelsius,
        )

    /**
     * Scales direct-cold fresh yeast percent by time and fridge temperature.
     */
    private fun directColdFreshYeastPercent(schedule: FermentationSchedule): Double {
        val referenceTemperaturePercent =
            DirectColdFreshYeastPercentAt24Hours * (schedule.coldHours / 24.0).pow(DirectColdTimeExponent)

        return referenceTemperaturePercent / temperatureFactor(
            actual = schedule.coldTemperatureCelsius,
            base = DirectColdReferenceTemperatureCelsius,
        )
    }

    /**
     * Applies lower yeast targets for preferment methods.
     */
    private fun methodFactor(doughMethod: DoughMethod): Double =
        when (doughMethod) {
            DoughMethod.DIRECT -> 1.0
            DoughMethod.POOLISH -> 0.75
            DoughMethod.BIGA -> 0.65
        }

    /**
     * Converts fresh yeast percentage into the selected yeast type and gram amounts.
     */
    private fun yeastAmounts(
        flourGrams: Double,
        freshYeastPercent: Double,
        yeastType: YeastType,
    ): YeastAmounts {
        val selectedYeastPercent = freshYeastPercent / yeastType.freshYeastRatio

        return YeastAmounts(
            selectedYeastPercent = selectedYeastPercent,
            selectedYeastGrams = flourGrams * selectedYeastPercent / 100.0,
            freshYeastEquivalentGrams = flourGrams * freshYeastPercent / 100.0,
        )
    }

    /**
     * Doubles yeast activity for every configured temperature step above the base temperature.
     */
    private fun temperatureFactor(actual: Double, base: Double): Double =
        2.0.pow((actual - base) / YeastActivityTemperatureStepCelsius)

    /**
     * Calculates the minimum fresh yeast percentage allowed for the dough hydration.
     */
    private fun minFreshYeastPercent(hydrationPercent: Double): Double =
        freshYeastPercentForWaterLiter(MinFreshYeastGramsPerWaterLiter, hydrationPercent)

    /**
     * Calculates the maximum fresh yeast percentage allowed for the dough hydration.
     */
    private fun maxFreshYeastPercent(hydrationPercent: Double): Double =
        freshYeastPercentForWaterLiter(MaxFreshYeastGramsPerWaterLiter, hydrationPercent)

    /**
     * Converts grams of fresh yeast per liter of water into baker percentage.
     */
    private fun freshYeastPercentForWaterLiter(yeastGrams: Double, hydrationPercent: Double): Double {
        val flourGramsPerWaterLiter = 1000.0 / (hydrationPercent / 100.0)
        return yeastGrams / flourGramsPerWaterLiter * 100.0
    }

    private data class FermentationEffect(
        val roomHours: Double,
        val coldHours: Double,
        val effectiveHours: Double,
    )

    private data class FreshYeastPercent(
        val minimum: Double,
        val maximum: Double,
        val beforeMethodFactor: Double,
        val afterMethodFactor: Double,
    )

    private data class YeastAmounts(
        val selectedYeastPercent: Double,
        val selectedYeastGrams: Double,
        val freshYeastEquivalentGrams: Double,
    )

    private companion object {
        const val ReferenceFreshYeastPercent = 3.0 / 1750.0 * 100.0
        const val ReferenceRoomHours = 8.0
        const val ReferenceRoomTemperatureCelsius = 25.0
        const val ReferenceColdTemperatureCelsius = 4.0
        const val YeastActivityTemperatureStepCelsius = 10.0
        const val ColdRetardationFactor = 0.24
        const val MinFreshYeastGramsPerWaterLiter = 0.1
        const val MaxFreshYeastGramsPerWaterLiter = 3.0
        const val DirectColdReferenceTemperatureCelsius = 5.0
        const val DirectColdFreshYeastPercentAt24Hours = 1.8
        const val DirectColdFreshYeastPercentAt48Hours = 0.7
        val DirectColdTimeExponent: Double =
            kotlin.math.ln(DirectColdFreshYeastPercentAt48Hours / DirectColdFreshYeastPercentAt24Hours) /
                kotlin.math.ln(48.0 / 24.0)
    }
}
