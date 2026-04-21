package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.DoughCalculationResponse
import com.pizzalab.backend.api.dough.dto.FinalMixResponse
import com.pizzalab.backend.api.dough.dto.PrefermentResponse
import com.pizzalab.backend.api.dough.dto.YeastCalculationResponse
import com.pizzalab.backend.domain.model.dough.DoughIngredients
import com.pizzalab.backend.domain.model.dough.FinalMixBreakdown
import com.pizzalab.backend.domain.model.dough.PrefermentBreakdown
import com.pizzalab.backend.domain.model.yeast.YeastCalculationDetails

/**
 * Converts domain results into the response contract returned by the REST API.
 */
internal fun DoughIngredients.toResponse(): DoughCalculationResponse =
    DoughCalculationResponse(
        flourGrams = flourGrams,
        waterGrams = waterGrams,
        saltGrams = saltGrams,
        yeastGrams = yeastGrams,
        totalDoughWeightGrams = totalDoughWeightGrams,
        preferment = preferment?.toResponse(),
        finalMix = finalMix.toResponse(),
        yeastCalculation = yeastCalculation.toResponse(),
    )

/**
 * Maps preferment-only ingredient weights to the API response.
 */
private fun PrefermentBreakdown.toResponse(): PrefermentResponse =
    PrefermentResponse(
        flourGrams = flourGrams,
        waterGrams = waterGrams,
        yeastGrams = yeastGrams,
    )

/**
 * Maps final-mix ingredient weights to the API response.
 */
private fun FinalMixBreakdown.toResponse(): FinalMixResponse =
    FinalMixResponse(
        flourGrams = flourGrams,
        waterGrams = waterGrams,
        saltGrams = saltGrams,
        yeastGrams = yeastGrams,
    )

/**
 * Exposes yeast calculation diagnostics for the UI.
 */
private fun YeastCalculationDetails.toResponse(): YeastCalculationResponse =
    YeastCalculationResponse(
        yeastType = yeastType,
        doughMethod = doughMethod,
        roomEffectHours = roomEffectHours,
        coldEffectHours = coldEffectHours,
        effectiveFermentationHours = effectiveFermentationHours,
        methodFactor = methodFactor,
        minFreshYeastPercent = minFreshYeastPercent,
        maxFreshYeastPercent = maxFreshYeastPercent,
        freshYeastPercentBeforeMethodFactor = freshYeastPercentBeforeMethodFactor,
        freshYeastPercent = freshYeastPercent,
        selectedYeastPercent = selectedYeastPercent,
        freshYeastEquivalentGrams = freshYeastEquivalentGrams,
        selectedYeastGrams = selectedYeastGrams,
        prefermentYeastGrams = prefermentYeastGrams,
        finalMixYeastGrams = finalMixYeastGrams,
    )
