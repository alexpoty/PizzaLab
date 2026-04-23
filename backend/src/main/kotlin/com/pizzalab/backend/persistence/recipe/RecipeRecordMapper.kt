package com.pizzalab.backend.persistence.recipe

import com.pizzalab.backend.api.dough.dto.DoughCalculationRequest
import com.pizzalab.backend.api.dough.dto.FermentationScheduleRequest
import com.pizzalab.backend.api.recipe.dto.CreateRecipeRequest
import com.pizzalab.backend.api.recipe.dto.RecipeResponse
import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import com.pizzalab.backend.domain.model.fermentation.FermentationPreset
import com.pizzalab.backend.domain.model.yeast.YeastType
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

/**
 * Converts API recipe input into the relational shape stored by Spring Data JDBC.
 */
fun CreateRecipeRequest.toRecord(): RecipeRecord {
    val formula = formula

    return RecipeRecord(
        recipeId = UUID.randomUUID(),
        name = name.trim(),
        pizzaCount = formula.pizzaCount,
        doughBallWeightGrams = formula.doughBallWeightGrams.toBigDecimal(),
        hydrationPercent = formula.hydrationPercent.toBigDecimal(),
        saltPercent = formula.saltPercent.toBigDecimal(),
        yeastType = formula.yeastType.name,
        doughMethod = formula.doughMethod.name,
        fermentationPreset = formula.fermentationPreset?.name,
        fermentationScheduleMode = formula.fermentationSchedule?.mode?.name,
        fermentationScheduleRoomHours = formula.fermentationSchedule?.roomHours?.toBigDecimal(),
        fermentationScheduleColdHours = formula.fermentationSchedule?.coldHours?.toBigDecimal(),
        fermentationScheduleRoomTemperatureCelsius = formula.fermentationSchedule?.roomTemperatureCelsius?.toBigDecimal(),
        fermentationScheduleColdTemperatureCelsius = formula.fermentationSchedule?.coldTemperatureCelsius?.toBigDecimal(),
        roomTemperatureCelsius = formula.roomTemperatureCelsius?.toBigDecimal(),
        coldTemperatureCelsius = formula.coldTemperatureCelsius?.toBigDecimal(),
        prefermentFlourPercent = formula.prefermentFlourPercent?.toBigDecimal(),
        createdAt = OffsetDateTime.now(ZoneOffset.UTC),
    ).also { it.newRecord = true }
}

/**
 * Converts stored rows back into the same formula contract used by the calculator API.
 */
fun RecipeRecord.toResponse(): RecipeResponse {
    return RecipeResponse(
        id = id,
        name = name,
        formula = DoughCalculationRequest(
            pizzaCount = pizzaCount,
            doughBallWeightGrams = doughBallWeightGrams.toDouble(),
            hydrationPercent = hydrationPercent.toDouble(),
            saltPercent = saltPercent.toDouble(),
            yeastType = YeastType.valueOf(yeastType),
            doughMethod = DoughMethod.valueOf(doughMethod),
            fermentationSchedule = toFermentationScheduleRequest(),
            fermentationPreset = fermentationPreset?.let { FermentationPreset.valueOf(it) },
            roomTemperatureCelsius = roomTemperatureCelsius?.toDouble(),
            coldTemperatureCelsius = coldTemperatureCelsius?.toDouble(),
            prefermentFlourPercent = prefermentFlourPercent?.toDouble(),
        ),
        createdAt = createdAt.toInstant(),
    )
}

private fun RecipeRecord.toFermentationScheduleRequest(): FermentationScheduleRequest? {
    val mode = fermentationScheduleMode ?: return null

    return FermentationScheduleRequest(
        mode = FermentationMode.valueOf(mode),
        roomHours = fermentationScheduleRoomHours?.toDouble() ?: 0.0,
        coldHours = fermentationScheduleColdHours?.toDouble() ?: 0.0,
        roomTemperatureCelsius = fermentationScheduleRoomTemperatureCelsius?.toDouble() ?: 20.0,
        coldTemperatureCelsius = fermentationScheduleColdTemperatureCelsius?.toDouble() ?: 4.0,
    )
}
