package com.pizzalab.backend.domain.model

data class YeastCalculationDetails(
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
