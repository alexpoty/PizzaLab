package com.pizzalab.backend.domain.model.fermentation

import com.pizzalab.backend.domain.model.dough.DoughMethod
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class FermentationPresetDefinitionTest {
    @Test
    fun `creates schedule from room preset definition`() {
        val schedule = FermentationPreset.ROOM_24H.definition().toSchedule(
            preset = FermentationPreset.ROOM_24H,
            doughMethod = DoughMethod.DIRECT,
            roomTemperatureCelsius = 20.0,
            coldTemperatureCelsius = null,
        )

        assertEquals(FermentationMode.ROOM, schedule.mode)
        assertEquals(24.0, schedule.roomHours)
        assertEquals(20.0, schedule.roomTemperatureCelsius)
        assertEquals(0.0, schedule.coldHours)
    }

    @Test
    fun `rejects preset when dough method is incompatible`() {
        val exception = assertFailsWith<IllegalArgumentException> {
            FermentationPreset.POOLISH_ROOM_16H_COLD_24H.definition().toSchedule(
                preset = FermentationPreset.POOLISH_ROOM_16H_COLD_24H,
                doughMethod = DoughMethod.DIRECT,
                roomTemperatureCelsius = 20.0,
                coldTemperatureCelsius = 4.0,
            )
        }

        assertEquals(
            "POOLISH_ROOM_16H_COLD_24H requires doughMethod POOLISH.",
            exception.message,
        )
    }

    @Test
    fun `rejects preset when required temperature is missing`() {
        val exception = assertFailsWith<IllegalArgumentException> {
            FermentationPreset.COLD_24H.definition().toSchedule(
                preset = FermentationPreset.COLD_24H,
                doughMethod = DoughMethod.DIRECT,
                roomTemperatureCelsius = null,
                coldTemperatureCelsius = null,
            )
        }

        assertEquals("COLD_24H requires temperature input.", exception.message)
    }

    @Test
    fun `describes preferment preset requirements`() {
        val definition = FermentationPreset.BIGA_ROOM_16H_COLD_24H.definition()

        assertEquals(listOf(DoughMethod.BIGA), definition.compatibleDoughMethods)
        assertEquals(FermentationMode.MIXED, definition.mode)
        assertEquals(16.0, definition.roomHours)
        assertEquals(24.0, definition.coldHours)
        assertEquals(true, definition.requiresRoomTemperature)
        assertEquals(true, definition.requiresColdTemperature)
    }
}
