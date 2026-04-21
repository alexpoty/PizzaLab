package com.pizzalab.backend.api.dough

import com.pizzalab.backend.api.dough.dto.DoughMetadataResponse
import com.pizzalab.backend.api.dough.dto.FermentationPresetResponse
import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationPreset
import com.pizzalab.backend.domain.model.fermentation.definition
import com.pizzalab.backend.domain.model.yeast.YeastType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dough")
class DoughMetadataController {
    /**
     * Returns enum values and preset requirements needed to render the calculator form.
     */
    @GetMapping("/metadata")
    fun metadata(): DoughMetadataResponse =
        DoughMetadataResponse(
            doughMethods = DoughMethod.entries.toList(),
            yeastTypes = YeastType.entries.toList(),
            fermentationPresets = FermentationPreset.entries.map { it.toResponse() },
        )

    /**
     * Converts a domain preset definition into the API metadata contract.
     */
    private fun FermentationPreset.toResponse(): FermentationPresetResponse =
        definition().let { definition ->
            FermentationPresetResponse(
                code = this,
                label = label,
                compatibleDoughMethods = definition.compatibleDoughMethods,
                requiresRoomTemperature = definition.requiresRoomTemperature,
                requiresColdTemperature = definition.requiresColdTemperature,
                roomHours = definition.roomHours,
                coldHours = definition.coldHours,
            )
        }

    /**
     * Keeps user-facing preset labels out of the domain model.
     */
    private val FermentationPreset.label: String
        get() = when (this) {
            FermentationPreset.ROOM_24H -> "24h room fermentation"
            FermentationPreset.COLD_24H -> "24h cold fermentation"
            FermentationPreset.COLD_48H -> "48h cold fermentation"
            FermentationPreset.POOLISH_ROOM_16H_COLD_24H -> "Poolish 16h room + 24h cold"
            FermentationPreset.BIGA_ROOM_16H_COLD_24H -> "Biga 16h room + 24h cold"
        }
}
