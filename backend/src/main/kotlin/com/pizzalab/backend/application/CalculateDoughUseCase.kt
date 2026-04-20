package com.pizzalab.backend.application

import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughIngredients
import com.pizzalab.backend.domain.service.DoughCalculator
import org.springframework.stereotype.Service

@Service
class CalculateDoughUseCase {
    private val calculator = DoughCalculator()

    fun execute(formula: DoughFormula): DoughIngredients = calculator.calculate(formula)
}
