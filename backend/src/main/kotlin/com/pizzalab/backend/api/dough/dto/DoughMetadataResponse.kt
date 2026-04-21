package com.pizzalab.backend.api.dough.dto

import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationPreset
import com.pizzalab.backend.domain.model.yeast.YeastType

data class DoughMetadataResponse(
    val doughMethods: List<DoughMethod>,
    val yeastTypes: List<YeastType>,
    val fermentationPresets: List<FermentationPresetResponse>,
)

data class FermentationPresetResponse(
    val code: FermentationPreset,
    val label: String,
    val compatibleDoughMethods: List<DoughMethod>,
    val requiresRoomTemperature: Boolean,
    val requiresColdTemperature: Boolean,
    val roomHours: Double,
    val coldHours: Double,
)
