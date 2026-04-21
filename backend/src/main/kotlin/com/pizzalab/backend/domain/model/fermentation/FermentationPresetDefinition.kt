package com.pizzalab.backend.domain.model.fermentation

import com.pizzalab.backend.domain.model.dough.DoughMethod

/**
 * Describes preset rules once so request mapping and metadata stay consistent.
 */
data class FermentationPresetDefinition(
    val compatibleDoughMethods: List<DoughMethod>,
    val mode: FermentationMode,
    val roomHours: Double,
    val coldHours: Double,
    val requiresRoomTemperature: Boolean,
    val requiresColdTemperature: Boolean,
) {
    /**
     * Expands the preset into a concrete schedule and validates dough method compatibility.
     */
    fun toSchedule(
        preset: FermentationPreset,
        doughMethod: DoughMethod,
        roomTemperatureCelsius: Double?,
        coldTemperatureCelsius: Double?,
    ): FermentationSchedule {
        require(doughMethod in compatibleDoughMethods) {
            "$preset requires doughMethod ${compatibleDoughMethods.first().name}."
        }

        return FermentationSchedule(
            mode = mode,
            roomHours = roomHours,
            roomTemperatureCelsius = roomTemperatureCelsius.requiredWhen(
                required = requiresRoomTemperature,
                preset = preset,
            ),
            coldHours = coldHours,
            coldTemperatureCelsius = coldTemperatureCelsius.requiredWhen(
                required = requiresColdTemperature,
                preset = preset,
            ),
        )
    }

    /**
     * Requires temperature input only for stages used by the selected preset.
     */
    private fun Double?.requiredWhen(required: Boolean, preset: FermentationPreset): Double {
        if (!required) {
            return this ?: DefaultUnusedTemperatureCelsius
        }

        return this ?: throw IllegalArgumentException("$preset requires temperature input.")
    }
}

/**
 * Returns the fermentation rules associated with each supported preset.
 */
fun FermentationPreset.definition(): FermentationPresetDefinition =
    when (this) {
        FermentationPreset.ROOM_24H ->
            FermentationPresetDefinition(
                compatibleDoughMethods = DoughMethod.entries.toList(),
                mode = FermentationMode.ROOM,
                roomHours = 24.0,
                coldHours = 0.0,
                requiresRoomTemperature = true,
                requiresColdTemperature = false,
            )

        FermentationPreset.COLD_24H ->
            FermentationPresetDefinition(
                compatibleDoughMethods = listOf(DoughMethod.DIRECT),
                mode = FermentationMode.COLD,
                roomHours = 0.0,
                coldHours = 24.0,
                requiresRoomTemperature = false,
                requiresColdTemperature = true,
            )

        FermentationPreset.COLD_48H ->
            FermentationPresetDefinition(
                compatibleDoughMethods = listOf(DoughMethod.DIRECT),
                mode = FermentationMode.COLD,
                roomHours = 0.0,
                coldHours = 48.0,
                requiresRoomTemperature = false,
                requiresColdTemperature = true,
            )

        FermentationPreset.POOLISH_ROOM_16H_COLD_24H ->
            FermentationPresetDefinition(
                compatibleDoughMethods = listOf(DoughMethod.POOLISH),
                mode = FermentationMode.MIXED,
                roomHours = 16.0,
                coldHours = 24.0,
                requiresRoomTemperature = true,
                requiresColdTemperature = true,
            )

        FermentationPreset.BIGA_ROOM_16H_COLD_24H ->
            FermentationPresetDefinition(
                compatibleDoughMethods = listOf(DoughMethod.BIGA),
                mode = FermentationMode.MIXED,
                roomHours = 16.0,
                coldHours = 24.0,
                requiresRoomTemperature = true,
                requiresColdTemperature = true,
            )
    }

private const val DefaultUnusedTemperatureCelsius = 20.0
