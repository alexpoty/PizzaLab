package com.pizzalab.backend.api.dough

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationPreset
import com.pizzalab.backend.domain.model.YeastType

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
