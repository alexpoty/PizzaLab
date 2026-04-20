package com.pizzalab.backend.domain.model

data class DoughIngredients(
    val flourGrams: Double,
    val waterGrams: Double,
    val saltGrams: Double,
    val yeastGrams: Double,
    val totalDoughWeightGrams: Double,
    val preferment: PrefermentBreakdown? = null,
    val finalMix: FinalMixBreakdown,
)
