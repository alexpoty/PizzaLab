package com.pizzalab.backend.domain.model

data class DoughFormula(
    val pizzaCount: Int,
    val doughBallWeightGrams: Double,
    val hydrationPercent: Double,
    val saltPercent: Double,
    val yeastType: YeastType,
    val doughMethod: DoughMethod,
    val fermentationSchedule: FermentationSchedule,
    val prefermentFlourPercent: Double? = null,
) {
    init {
        require(pizzaCount > 0) { "Pizza count must be greater than zero." }
        require(doughBallWeightGrams > 0) { "Dough ball weight must be greater than zero." }
        require(hydrationPercent > 0) { "Hydration percent must be greater than zero." }
        require(saltPercent >= 0) { "Salt percent cannot be negative." }
        require(prefermentFlourPercent == null || prefermentFlourPercent > 0) {
            "Preferment flour percent must be greater than zero."
        }
        require(prefermentFlourPercent == null || prefermentFlourPercent < 100) {
            "Preferment flour percent must be less than 100."
        }
    }

    val totalDoughWeightGrams: Double
        get() = pizzaCount * doughBallWeightGrams
}
