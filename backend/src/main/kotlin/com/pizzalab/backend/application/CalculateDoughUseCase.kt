package com.pizzalab.backend.application

import com.pizzalab.backend.domain.model.dough.DoughFormula
import com.pizzalab.backend.domain.model.dough.DoughIngredients
import com.pizzalab.backend.domain.service.DoughCalculator
import org.springframework.stereotype.Service

@Service
class CalculateDoughUseCase(
    private val calculator: DoughCalculator,
) {
    /**
     * Runs the dough calculation application use case.
     */
    fun execute(formula: DoughFormula): DoughIngredients = calculator.calculate(formula)
}
