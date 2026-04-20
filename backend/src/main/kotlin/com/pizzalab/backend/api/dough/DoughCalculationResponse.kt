package com.pizzalab.backend.api.dough

data class DoughCalculationResponse(
    val flourGrams: Double,
    val waterGrams: Double,
    val saltGrams: Double,
    val yeastGrams: Double,
    val totalDoughWeightGrams: Double,
    val preferment: PrefermentResponse?,
    val finalMix: FinalMixResponse,
    val yeastCalculation: YeastCalculationResponse,
)
