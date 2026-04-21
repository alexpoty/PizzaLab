package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import com.pizzalab.backend.api.dough.dto.DoughCalculationResponse
import com.pizzalab.backend.application.CalculateDoughUseCase
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dough")
class DoughController(
    private val calculateDough: CalculateDoughUseCase,
) {
    /**
     * Accepts dough calculation input and returns ingredient weights for the selected method.
     */
    @PostMapping("/calculate")
    fun calculate(@Valid @RequestBody request: DoughCalculationRequest): DoughCalculationResponse {
        return calculateDough.execute(request.toFormula()).toResponse()
    }
}
