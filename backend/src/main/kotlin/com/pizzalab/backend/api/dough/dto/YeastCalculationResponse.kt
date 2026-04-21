package com.pizzalab.backend.api.dough.dto

import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.yeast.YeastType

data class YeastCalculationResponse(
    val yeastType: YeastType,
    val doughMethod: DoughMethod,
    val roomEffectHours: Double,
    val coldEffectHours: Double,
    val effectiveFermentationHours: Double,
    val methodFactor: Double,
    val minFreshYeastPercent: Double,
    val maxFreshYeastPercent: Double,
    val freshYeastPercentBeforeMethodFactor: Double,
    val freshYeastPercent: Double,
    val selectedYeastPercent: Double,
    val freshYeastEquivalentGrams: Double,
    val selectedYeastGrams: Double,
    val prefermentYeastGrams: Double,
    val finalMixYeastGrams: Double,
)
