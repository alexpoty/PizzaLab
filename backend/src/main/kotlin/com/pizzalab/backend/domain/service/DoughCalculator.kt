package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughIngredients
import com.pizzalab.backend.domain.model.FinalMixBreakdown
import com.pizzalab.backend.domain.model.FermentationMode
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.PrefermentBreakdown
import com.pizzalab.backend.domain.model.YeastCalculation
import com.pizzalab.backend.domain.model.YeastCalculationDetails
import kotlin.math.round

class DoughCalculator(
    private val yeastCalculator: YeastCalculator = YeastCalculator(),
) {
    fun calculate(formula: DoughFormula): DoughIngredients {
        val estimatedFlourGrams = estimateFlourWithoutYeast(formula)
        val yeastCalculation = calculateYeast(
            formula = formula,
            flourGrams = estimatedFlourGrams,
        )
        val yeastPercent = yeastCalculation.selectedYeastPercent

        val totalBakerPercent = 100.0 +
            formula.hydrationPercent +
            formula.saltPercent +
            yeastPercent

        val finalFlourGrams = formula.totalDoughWeightGrams / (totalBakerPercent / 100.0)
        val finalYeastCalculation = calculateYeast(
            formula = formula,
            flourGrams = finalFlourGrams,
        )
        val waterGrams = finalFlourGrams * formula.hydrationPercent / 100.0
        val saltGrams = finalFlourGrams * formula.saltPercent / 100.0
        val yeastGrams = finalYeastCalculation.details.selectedYeastGrams
        val preferment = calculatePreferment(
            formula = formula,
            flourGrams = finalFlourGrams,
            yeastGrams = finalYeastCalculation.details.prefermentYeastGrams,
        )
        val finalMix = calculateFinalMix(
            flourGrams = finalFlourGrams,
            waterGrams = waterGrams,
            saltGrams = saltGrams,
            yeastGrams = finalYeastCalculation.details.finalMixYeastGrams,
            preferment = preferment,
        )

        return DoughIngredients(
            flourGrams = finalFlourGrams.roundToGrams(),
            waterGrams = waterGrams.roundToGrams(),
            saltGrams = saltGrams.roundToGrams(),
            yeastGrams = yeastGrams.roundToGrams(),
            totalDoughWeightGrams = formula.totalDoughWeightGrams.roundToGrams(),
            preferment = preferment,
            finalMix = finalMix,
            yeastCalculation = finalYeastCalculation.details.rounded(),
        )
    }

    private fun calculateYeast(formula: DoughFormula, flourGrams: Double): YeastCalculation {
        if (formula.doughMethod == DoughMethod.DIRECT) {
            return yeastCalculator.calculateYeastPercent(
                schedule = formula.fermentationSchedule,
                yeastType = formula.yeastType,
                doughMethod = formula.doughMethod,
                hydrationPercent = formula.hydrationPercent,
                flourGrams = flourGrams,
            )
        }

        val prefermentCalculation = yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule.prefermentSchedule(),
            yeastType = formula.yeastType,
            doughMethod = formula.doughMethod,
            hydrationPercent = formula.hydrationPercent,
            flourGrams = flourGrams,
        )

        if (formula.fermentationSchedule.coldHours <= 0.0) {
            return prefermentCalculation.copy(
                details = prefermentCalculation.details.copy(
                    prefermentYeastGrams = prefermentCalculation.details.selectedYeastGrams,
                    finalMixYeastGrams = 0.0,
                ),
            )
        }

        val finalMixCalculation = yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule.finalMixColdSchedule(),
            yeastType = formula.yeastType,
            doughMethod = DoughMethod.DIRECT,
            hydrationPercent = formula.hydrationPercent,
            flourGrams = flourGrams,
        )
        val selectedYeastPercent = prefermentCalculation.selectedYeastPercent + finalMixCalculation.selectedYeastPercent
        val selectedYeastGrams = prefermentCalculation.details.selectedYeastGrams +
            finalMixCalculation.details.selectedYeastGrams
        val freshYeastEquivalentGrams = prefermentCalculation.details.freshYeastEquivalentGrams +
            finalMixCalculation.details.freshYeastEquivalentGrams

        return YeastCalculation(
            selectedYeastPercent = selectedYeastPercent,
            details = prefermentCalculation.details.copy(
                coldEffectHours = finalMixCalculation.details.coldEffectHours,
                effectiveFermentationHours = prefermentCalculation.details.effectiveFermentationHours +
                    finalMixCalculation.details.effectiveFermentationHours,
                selectedYeastPercent = selectedYeastPercent,
                freshYeastEquivalentGrams = freshYeastEquivalentGrams,
                selectedYeastGrams = selectedYeastGrams,
                prefermentYeastGrams = prefermentCalculation.details.selectedYeastGrams,
                finalMixYeastGrams = finalMixCalculation.details.selectedYeastGrams,
            ),
        )
    }

    private fun FermentationSchedule.prefermentSchedule(): FermentationSchedule =
        if (roomHours > 0.0) {
            FermentationSchedule(
                mode = FermentationMode.ROOM,
                roomHours = roomHours,
                roomTemperatureCelsius = roomTemperatureCelsius,
            )
        } else {
            this
        }

    private fun FermentationSchedule.finalMixColdSchedule(): FermentationSchedule =
        FermentationSchedule(
            mode = FermentationMode.COLD,
            coldHours = coldHours,
            coldTemperatureCelsius = coldTemperatureCelsius,
        )

    private fun estimateFlourWithoutYeast(formula: DoughFormula): Double {
        val totalBakerPercentWithoutYeast = 100.0 + formula.hydrationPercent + formula.saltPercent
        return formula.totalDoughWeightGrams / (totalBakerPercentWithoutYeast / 100.0)
    }

    private fun YeastCalculationDetails.rounded(): YeastCalculationDetails =
        copy(
            roomEffectHours = roomEffectHours.roundToGrams(),
            coldEffectHours = coldEffectHours.roundToGrams(),
            effectiveFermentationHours = effectiveFermentationHours.roundToGrams(),
            methodFactor = methodFactor.roundToPercent(),
            minFreshYeastPercent = minFreshYeastPercent.roundToPercent(),
            maxFreshYeastPercent = maxFreshYeastPercent.roundToPercent(),
            freshYeastPercentBeforeMethodFactor = freshYeastPercentBeforeMethodFactor.roundToPercent(),
            freshYeastPercent = freshYeastPercent.roundToPercent(),
            selectedYeastPercent = selectedYeastPercent.roundToPercent(),
            freshYeastEquivalentGrams = freshYeastEquivalentGrams.roundToGrams(),
            selectedYeastGrams = selectedYeastGrams.roundToGrams(),
            prefermentYeastGrams = prefermentYeastGrams.roundToGrams(),
            finalMixYeastGrams = finalMixYeastGrams.roundToGrams(),
        )

    private fun calculatePreferment(
        formula: DoughFormula,
        flourGrams: Double,
        yeastGrams: Double,
    ): PrefermentBreakdown? {
        if (formula.doughMethod == DoughMethod.DIRECT) {
            return null
        }

        val flourPercent = formula.prefermentFlourPercent ?: when (formula.doughMethod) {
            DoughMethod.POOLISH -> 30.0
            DoughMethod.BIGA -> 45.0
            DoughMethod.DIRECT -> 0.0
        }
        val prefermentFlourGrams = flourGrams * flourPercent / 100.0
        val prefermentHydration = when (formula.doughMethod) {
            DoughMethod.POOLISH -> 100.0
            DoughMethod.BIGA -> 50.0
            DoughMethod.DIRECT -> 0.0
        }
        val prefermentWaterGrams = prefermentFlourGrams * prefermentHydration / 100.0
        val totalWaterGrams = flourGrams * formula.hydrationPercent / 100.0
        require(prefermentWaterGrams <= totalWaterGrams) {
            "Preferment water cannot exceed total dough water. Lower preferment flour percent or increase hydration."
        }

        return PrefermentBreakdown(
            flourGrams = prefermentFlourGrams.roundToGrams(),
            waterGrams = prefermentWaterGrams.roundToGrams(),
            yeastGrams = yeastGrams.roundToGrams(),
        )
    }

    private fun calculateFinalMix(
        flourGrams: Double,
        waterGrams: Double,
        saltGrams: Double,
        yeastGrams: Double,
        preferment: PrefermentBreakdown?,
    ): FinalMixBreakdown {
        if (preferment == null) {
            return FinalMixBreakdown(
                flourGrams = flourGrams.roundToGrams(),
                waterGrams = waterGrams.roundToGrams(),
                saltGrams = saltGrams.roundToGrams(),
                yeastGrams = yeastGrams.roundToGrams(),
            )
        }

        return FinalMixBreakdown(
            flourGrams = (flourGrams - preferment.flourGrams).roundToGrams(),
            waterGrams = (waterGrams - preferment.waterGrams).roundToGrams(),
            saltGrams = saltGrams.roundToGrams(),
            yeastGrams = yeastGrams.roundToGrams(),
        )
    }

    private fun Double.roundToGrams(): Double = round(this * 10.0) / 10.0

    private fun Double.roundToPercent(): Double = round(this * 10_000.0) / 10_000.0
}
