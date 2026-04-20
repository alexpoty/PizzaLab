package com.pizzalab.backend.api.dough

import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationPreset
import com.pizzalab.backend.domain.model.YeastType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dough")
class DoughMetadataController {
    @GetMapping("/metadata")
    fun metadata(): DoughMetadataResponse =
        DoughMetadataResponse(
            doughMethods = DoughMethod.entries.toList(),
            yeastTypes = YeastType.entries.toList(),
            fermentationPresets = FermentationPreset.entries.map { it.toResponse() },
        )

    private fun FermentationPreset.toResponse(): FermentationPresetResponse =
        when (this) {
            FermentationPreset.ROOM_24H ->
                FermentationPresetResponse(
                    code = this,
                    label = "24h room fermentation",
                    compatibleDoughMethods = DoughMethod.entries.toList(),
                    requiresRoomTemperature = true,
                    requiresColdTemperature = false,
                    roomHours = 24.0,
                    coldHours = 0.0,
                )

            FermentationPreset.COLD_24H ->
                FermentationPresetResponse(
                    code = this,
                    label = "24h cold fermentation",
                    compatibleDoughMethods = listOf(DoughMethod.DIRECT),
                    requiresRoomTemperature = false,
                    requiresColdTemperature = true,
                    roomHours = 0.0,
                    coldHours = 24.0,
                )

            FermentationPreset.COLD_48H ->
                FermentationPresetResponse(
                    code = this,
                    label = "48h cold fermentation",
                    compatibleDoughMethods = listOf(DoughMethod.DIRECT),
                    requiresRoomTemperature = false,
                    requiresColdTemperature = true,
                    roomHours = 0.0,
                    coldHours = 48.0,
                )

            FermentationPreset.POOLISH_ROOM_16H_COLD_24H ->
                FermentationPresetResponse(
                    code = this,
                    label = "Poolish 16h room + 24h cold",
                    compatibleDoughMethods = listOf(DoughMethod.POOLISH),
                    requiresRoomTemperature = true,
                    requiresColdTemperature = true,
                    roomHours = 16.0,
                    coldHours = 24.0,
                )

            FermentationPreset.BIGA_ROOM_16H_COLD_24H ->
                FermentationPresetResponse(
                    code = this,
                    label = "Biga 16h room + 24h cold",
                    compatibleDoughMethods = listOf(DoughMethod.BIGA),
                    requiresRoomTemperature = true,
                    requiresColdTemperature = true,
                    roomHours = 16.0,
                    coldHours = 24.0,
                )
        }
}
