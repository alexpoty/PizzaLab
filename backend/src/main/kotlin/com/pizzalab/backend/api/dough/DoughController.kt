package com.pizzalab.backend.api.dough

import com.pizzalab.backend.application.CalculateDoughUseCase
import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughIngredients
import com.pizzalab.backend.domain.model.FinalMixBreakdown
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.PrefermentBreakdown
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
    @PostMapping("/calculate")
    fun calculate(@Valid @RequestBody request: DoughCalculationRequest): DoughCalculationResponse {
        return calculateDough.execute(request.toFormula()).toResponse()
    }

    private fun DoughCalculationRequest.toFormula(): DoughFormula =
        DoughFormula(
            pizzaCount = pizzaCount,
            doughBallWeightGrams = doughBallWeightGrams,
            hydrationPercent = hydrationPercent,
            saltPercent = saltPercent,
            yeastType = yeastType,
            doughMethod = doughMethod,
            fermentationSchedule = fermentationSchedule.toDomain(),
            prefermentFlourPercent = prefermentFlourPercent,
        )

    private fun FermentationScheduleRequest.toDomain(): FermentationSchedule =
        FermentationSchedule(
            mode = mode,
            roomHours = roomHours,
            roomTemperatureCelsius = roomTemperatureCelsius,
            coldHours = coldHours,
            coldTemperatureCelsius = coldTemperatureCelsius,
        )

    private fun DoughIngredients.toResponse(): DoughCalculationResponse =
        DoughCalculationResponse(
            flourGrams = flourGrams,
            waterGrams = waterGrams,
            saltGrams = saltGrams,
            yeastGrams = yeastGrams,
            totalDoughWeightGrams = totalDoughWeightGrams,
            preferment = preferment?.toResponse(),
            finalMix = finalMix.toResponse(),
        )

    private fun PrefermentBreakdown.toResponse(): PrefermentResponse =
        PrefermentResponse(
            flourGrams = flourGrams,
            waterGrams = waterGrams,
            yeastGrams = yeastGrams,
        )

    private fun FinalMixBreakdown.toResponse(): FinalMixResponse =
        FinalMixResponse(
            flourGrams = flourGrams,
            waterGrams = waterGrams,
            saltGrams = saltGrams,
            yeastGrams = yeastGrams,
        )
}
