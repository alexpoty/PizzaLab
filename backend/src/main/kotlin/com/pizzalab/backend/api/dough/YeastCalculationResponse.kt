package com.pizzalab.backend.api.dough

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.YeastType

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
)
