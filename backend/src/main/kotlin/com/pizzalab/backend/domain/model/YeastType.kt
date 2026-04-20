package com.pizzalab.backend.domain.model

enum class YeastType(val instantYeastRatio: Double) {
    INSTANT(1.0),
    ACTIVE_DRY(1.25),
    FRESH(3.0),
}
