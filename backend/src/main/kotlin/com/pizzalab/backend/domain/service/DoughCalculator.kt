package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.dough.DoughFormula
import com.pizzalab.backend.domain.model.dough.DoughIngredients
import com.pizzalab.backend.domain.model.dough.FinalMixBreakdown
import com.pizzalab.backend.domain.model.dough.PrefermentBreakdown
import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import com.pizzalab.backend.domain.model.fermentation.FermentationSchedule
import com.pizzalab.backend.domain.model.yeast.YeastCalculation
import com.pizzalab.backend.domain.model.yeast.YeastCalculationDetails
import kotlin.math.round

class DoughCalculator(
    private val yeastCalculator: YeastCalculator = YeastCalculator(),
) {
    /**
     * Calculates ingredient weights from baker percentages and fermentation parameters.
     */
    fun calculate(formula: DoughFormula): DoughIngredients {
        val finalFlourGrams = calculateFinalFlourGrams(formula)
        val finalYeastCalculation = calculateYeast(
            formula = formula,
            flourGrams = finalFlourGrams,
        )
        val baseIngredients = calculateBaseIngredients(
            formula = formula,
            flourGrams = finalFlourGrams,
            yeastGrams = finalYeastCalculation.details.selectedYeastGrams,
        )
        val preferment = calculatePreferment(
            formula = formula,
            flourGrams = baseIngredients.flourGrams,
            waterGrams = baseIngredients.waterGrams,
            yeastGrams = finalYeastCalculation.details.prefermentYeastGrams,
        )
        val finalMix = calculateFinalMix(
            flourGrams = baseIngredients.flourGrams,
            waterGrams = baseIngredients.waterGrams,
            saltGrams = baseIngredients.saltGrams,
            yeastGrams = finalYeastCalculation.details.finalMixYeastGrams,
            preferment = preferment,
        )

        return DoughIngredients(
            flourGrams = baseIngredients.flourGrams.roundToGrams(),
            waterGrams = baseIngredients.waterGrams.roundToGrams(),
            saltGrams = baseIngredients.saltGrams.roundToGrams(),
            yeastGrams = baseIngredients.yeastGrams.roundToGrams(),
            totalDoughWeightGrams = formula.totalDoughWeightGrams.roundToGrams(),
            preferment = preferment,
            finalMix = finalMix,
            yeastCalculation = finalYeastCalculation.details.rounded(),
        )
    }

    /**
     * Recalculates flour after estimating yeast, because yeast contributes to total dough weight.
     */
    private fun calculateFinalFlourGrams(formula: DoughFormula): Double {
        val estimatedFlourGrams = estimateFlourWithoutYeast(formula)
        val yeastCalculation = calculateYeast(
            formula = formula,
            flourGrams = estimatedFlourGrams,
        )
        val totalBakerPercent = totalBakerPercent(
            formula = formula,
            yeastPercent = yeastCalculation.selectedYeastPercent,
        )

        return formula.totalDoughWeightGrams / (totalBakerPercent / 100.0)
    }

    /**
     * Sums all baker percentages used to derive flour from the target dough weight.
     */
    private fun totalBakerPercent(
        formula: DoughFormula,
        yeastPercent: Double,
    ): Double =
        100.0 + formula.hydrationPercent + formula.saltPercent + yeastPercent

    /**
     * Builds the unrounded total ingredient weights before preferment is split out.
     */
    private fun calculateBaseIngredients(
        formula: DoughFormula,
        flourGrams: Double,
        yeastGrams: Double,
    ): BaseIngredients =
        BaseIngredients(
            flourGrams = flourGrams,
            waterGrams = flourGrams * formula.hydrationPercent / 100.0,
            saltGrams = flourGrams * formula.saltPercent / 100.0,
            yeastGrams = yeastGrams,
        )

    /**
     * Routes yeast calculation by dough method because preferments can split yeast across stages.
     */
    private fun calculateYeast(formula: DoughFormula, flourGrams: Double): YeastCalculation =
        if (formula.doughMethod == DoughMethod.DIRECT) {
            calculateDirectYeast(
                formula = formula,
                flourGrams = flourGrams,
            )
        } else {
            calculatePrefermentYeast(
                formula = formula,
                flourGrams = flourGrams,
            )
        }

    /**
     * Calculates yeast for doughs mixed in a single stage.
     */
    private fun calculateDirectYeast(formula: DoughFormula, flourGrams: Double): YeastCalculation =
        yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule,
            yeastType = formula.yeastType,
            doughMethod = formula.doughMethod,
            hydrationPercent = formula.hydrationPercent,
            flourGrams = flourGrams,
        )

    /**
     * Calculates yeast for preferment doughs and adds final-mix yeast when cold fermentation follows.
     */
    private fun calculatePrefermentYeast(formula: DoughFormula, flourGrams: Double): YeastCalculation {
        val prefermentCalculation = yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule.prefermentSchedule(),
            yeastType = formula.yeastType,
            doughMethod = formula.doughMethod,
            hydrationPercent = formula.hydrationPercent,
            flourGrams = flourGrams,
        )

        if (formula.fermentationSchedule.coldHours <= 0.0) {
            return prefermentOnlyYeast(prefermentCalculation)
        }

        val finalMixCalculation = yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule.finalMixColdSchedule(),
            yeastType = formula.yeastType,
            doughMethod = DoughMethod.DIRECT,
            hydrationPercent = formula.hydrationPercent,
            flourGrams = flourGrams,
        )

        return combinedPrefermentYeast(
            prefermentCalculation = prefermentCalculation,
            finalMixCalculation = finalMixCalculation,
        )
    }

    /**
     * Marks all selected yeast as preferment yeast when there is no later cold stage.
     */
    private fun prefermentOnlyYeast(prefermentCalculation: YeastCalculation): YeastCalculation =
        prefermentCalculation.copy(
            details = prefermentCalculation.details.copy(
                prefermentYeastGrams = prefermentCalculation.details.selectedYeastGrams,
                finalMixYeastGrams = 0.0,
            ),
        )

    /**
     * Combines preferment-stage and final-mix yeast into one calculation result.
     */
    private fun combinedPrefermentYeast(
        prefermentCalculation: YeastCalculation,
        finalMixCalculation: YeastCalculation,
    ): YeastCalculation {
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

    /**
     * Extracts the room-temperature part used to ferment the preferment.
     */
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

    /**
     * Extracts the cold stage used after the preferment is mixed into final dough.
     */
    private fun FermentationSchedule.finalMixColdSchedule(): FermentationSchedule =
        FermentationSchedule(
            mode = FermentationMode.COLD,
            coldHours = coldHours,
            coldTemperatureCelsius = coldTemperatureCelsius,
        )

    /**
     * Provides the first flour estimate before yeast percentage is known.
     */
    private fun estimateFlourWithoutYeast(formula: DoughFormula): Double {
        val totalBakerPercentWithoutYeast = 100.0 + formula.hydrationPercent + formula.saltPercent
        return formula.totalDoughWeightGrams / (totalBakerPercentWithoutYeast / 100.0)
    }

    /**
     * Rounds calculation details to API-friendly precision after all formulas are complete.
     */
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

    /**
     * Splits flour, water, and yeast into the preferment portion when the method requires it.
     */
    private fun calculatePreferment(
        formula: DoughFormula,
        flourGrams: Double,
        waterGrams: Double,
        yeastGrams: Double,
    ): PrefermentBreakdown? {
        if (formula.doughMethod == DoughMethod.DIRECT) {
            return null
        }

        val settings = prefermentSettings(formula)
        val prefermentFlourGrams = flourGrams * settings.flourPercent / 100.0
        val prefermentWaterGrams = prefermentFlourGrams * settings.hydrationPercent / 100.0
        require(prefermentWaterGrams <= waterGrams) {
            "Preferment water cannot exceed total dough water. Lower preferment flour percent or increase hydration."
        }

        return PrefermentBreakdown(
            flourGrams = prefermentFlourGrams.roundToGrams(),
            waterGrams = prefermentWaterGrams.roundToGrams(),
            yeastGrams = yeastGrams.roundToGrams(),
        )
    }

    /**
     * Resolves default preferment flour and hydration percentages for poolish and biga.
     */
    private fun prefermentSettings(formula: DoughFormula): PrefermentSettings {
        val defaultFlourPercent = when (formula.doughMethod) {
            DoughMethod.POOLISH -> 30.0
            DoughMethod.BIGA -> 45.0
            DoughMethod.DIRECT -> 0.0
        }
        val hydrationPercent = when (formula.doughMethod) {
            DoughMethod.POOLISH -> 100.0
            DoughMethod.BIGA -> 50.0
            DoughMethod.DIRECT -> 0.0
        }

        return PrefermentSettings(
            flourPercent = formula.prefermentFlourPercent ?: defaultFlourPercent,
            hydrationPercent = hydrationPercent,
        )
    }

    /**
     * Calculates the ingredients still added during final mixing after preferment is removed.
     */
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

    /**
     * Rounds ingredient weights to one decimal gram.
     */
    private fun Double.roundToGrams(): Double = round(this * 10.0) / 10.0

    /**
     * Rounds baker percentages and yeast percentages to four decimal places.
     */
    private fun Double.roundToPercent(): Double = round(this * 10_000.0) / 10_000.0

    private data class BaseIngredients(
        val flourGrams: Double,
        val waterGrams: Double,
        val saltGrams: Double,
        val yeastGrams: Double,
    )

    private data class PrefermentSettings(
        val flourPercent: Double,
        val hydrationPercent: Double,
    )
}
