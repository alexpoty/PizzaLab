package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughIngredients
import com.pizzalab.backend.domain.model.FinalMixBreakdown
import com.pizzalab.backend.domain.model.PrefermentBreakdown
import kotlin.math.round

class DoughCalculator(
    private val yeastCalculator: YeastCalculator = YeastCalculator(),
) {
    fun calculate(formula: DoughFormula): DoughIngredients {
        val yeastPercent = yeastCalculator.calculateYeastPercent(
            schedule = formula.fermentationSchedule,
            yeastType = formula.yeastType,
            doughMethod = formula.doughMethod,
            hydrationPercent = formula.hydrationPercent,
        )

        val totalBakerPercent = 100.0 +
            formula.hydrationPercent +
            formula.saltPercent +
            yeastPercent

        val flourGrams = formula.totalDoughWeightGrams / (totalBakerPercent / 100.0)
        val waterGrams = flourGrams * formula.hydrationPercent / 100.0
        val saltGrams = flourGrams * formula.saltPercent / 100.0
        val yeastGrams = flourGrams * yeastPercent / 100.0
        val preferment = calculatePreferment(formula, flourGrams, yeastGrams)
        val finalMix = calculateFinalMix(
            flourGrams = flourGrams,
            waterGrams = waterGrams,
            saltGrams = saltGrams,
            yeastGrams = yeastGrams,
            preferment = preferment,
        )

        return DoughIngredients(
            flourGrams = flourGrams.roundToGrams(),
            waterGrams = waterGrams.roundToGrams(),
            saltGrams = saltGrams.roundToGrams(),
            yeastGrams = yeastGrams.roundToGrams(),
            totalDoughWeightGrams = formula.totalDoughWeightGrams.roundToGrams(),
            preferment = preferment,
            finalMix = finalMix,
        )
    }

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
            yeastGrams = 0.0,
        )
    }

    private fun Double.roundToGrams(): Double = round(this * 10.0) / 10.0
}
