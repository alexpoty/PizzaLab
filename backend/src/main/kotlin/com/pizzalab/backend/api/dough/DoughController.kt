package com.pizzalab.backend.api.dough

import com.pizzalab.backend.application.CalculateDoughUseCase
import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughIngredients
import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FinalMixBreakdown
import com.pizzalab.backend.domain.model.FermentationMode
import com.pizzalab.backend.domain.model.FermentationPreset
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.PrefermentBreakdown
import com.pizzalab.backend.domain.model.YeastCalculationDetails
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
            fermentationSchedule = resolveFermentationSchedule(),
            prefermentFlourPercent = prefermentFlourPercent,
        )

    private fun DoughCalculationRequest.resolveFermentationSchedule(): FermentationSchedule {
        if (fermentationSchedule != null) {
            return fermentationSchedule.toDomain()
        }

        return fermentationPreset?.toSchedule(
            doughMethod = doughMethod,
            roomTemperatureCelsius = roomTemperatureCelsius,
            coldTemperatureCelsius = coldTemperatureCelsius,
        ) ?: throw IllegalArgumentException("Either fermentationSchedule or fermentationPreset must be provided.")
    }

    private fun FermentationScheduleRequest.toDomain(): FermentationSchedule =
        FermentationSchedule(
            mode = mode,
            roomHours = roomHours,
            roomTemperatureCelsius = roomTemperatureCelsius,
            coldHours = coldHours,
            coldTemperatureCelsius = coldTemperatureCelsius,
        )

    private fun FermentationPreset.toSchedule(
        doughMethod: DoughMethod,
        roomTemperatureCelsius: Double?,
        coldTemperatureCelsius: Double?,
    ): FermentationSchedule =
        when (this) {
            FermentationPreset.ROOM_24H ->
                FermentationSchedule(
                    mode = FermentationMode.ROOM,
                    roomHours = 24.0,
                    roomTemperatureCelsius = roomTemperatureCelsius.requiredFor("ROOM_24H"),
                )

            FermentationPreset.COLD_24H ->
                FermentationSchedule(
                    mode = FermentationMode.COLD,
                    coldHours = 24.0,
                    coldTemperatureCelsius = coldTemperatureCelsius.requiredFor("COLD_24H"),
                )

            FermentationPreset.COLD_48H ->
                FermentationSchedule(
                    mode = FermentationMode.COLD,
                    coldHours = 48.0,
                    coldTemperatureCelsius = coldTemperatureCelsius.requiredFor("COLD_48H"),
                )

            FermentationPreset.POOLISH_ROOM_16H_COLD_24H -> {
                require(doughMethod == DoughMethod.POOLISH) {
                    "POOLISH_ROOM_16H_COLD_24H requires doughMethod POOLISH."
                }
                mixedPrefermentSchedule(
                    presetName = "POOLISH_ROOM_16H_COLD_24H",
                    roomTemperatureCelsius = roomTemperatureCelsius,
                    coldTemperatureCelsius = coldTemperatureCelsius,
                )
            }

            FermentationPreset.BIGA_ROOM_16H_COLD_24H -> {
                require(doughMethod == DoughMethod.BIGA) {
                    "BIGA_ROOM_16H_COLD_24H requires doughMethod BIGA."
                }
                mixedPrefermentSchedule(
                    presetName = "BIGA_ROOM_16H_COLD_24H",
                    roomTemperatureCelsius = roomTemperatureCelsius,
                    coldTemperatureCelsius = coldTemperatureCelsius,
                )
            }
        }

    private fun mixedPrefermentSchedule(
        presetName: String,
        roomTemperatureCelsius: Double?,
        coldTemperatureCelsius: Double?,
    ): FermentationSchedule =
        FermentationSchedule(
            mode = FermentationMode.MIXED,
            roomHours = 16.0,
            roomTemperatureCelsius = roomTemperatureCelsius.requiredFor(presetName),
            coldHours = 24.0,
            coldTemperatureCelsius = coldTemperatureCelsius.requiredFor(presetName),
        )

    private fun Double?.requiredFor(presetName: String): Double =
        this ?: throw IllegalArgumentException("$presetName requires temperature input.")

    private fun DoughIngredients.toResponse(): DoughCalculationResponse =
        DoughCalculationResponse(
            flourGrams = flourGrams,
            waterGrams = waterGrams,
            saltGrams = saltGrams,
            yeastGrams = yeastGrams,
            totalDoughWeightGrams = totalDoughWeightGrams,
            preferment = preferment?.toResponse(),
            finalMix = finalMix.toResponse(),
            yeastCalculation = yeastCalculation.toResponse(),
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

    private fun YeastCalculationDetails.toResponse(): YeastCalculationResponse =
        YeastCalculationResponse(
            yeastType = yeastType,
            doughMethod = doughMethod,
            roomEffectHours = roomEffectHours,
            coldEffectHours = coldEffectHours,
            effectiveFermentationHours = effectiveFermentationHours,
            methodFactor = methodFactor,
            minFreshYeastPercent = minFreshYeastPercent,
            maxFreshYeastPercent = maxFreshYeastPercent,
            freshYeastPercentBeforeMethodFactor = freshYeastPercentBeforeMethodFactor,
            freshYeastPercent = freshYeastPercent,
            selectedYeastPercent = selectedYeastPercent,
            freshYeastEquivalentGrams = freshYeastEquivalentGrams,
            selectedYeastGrams = selectedYeastGrams,
            prefermentYeastGrams = prefermentYeastGrams,
            finalMixYeastGrams = finalMixYeastGrams,
        )
}
