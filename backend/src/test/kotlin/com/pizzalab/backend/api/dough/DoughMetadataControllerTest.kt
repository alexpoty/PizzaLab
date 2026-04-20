package com.pizzalab.backend.api.dough

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(DoughMetadataController::class)
class DoughMetadataControllerTest(
    @param:Autowired private val mockMvc: MockMvc,
) {
    @Test
    fun `returns available dough calculation metadata`() {
        mockMvc.get("/api/dough/metadata")
            .andExpect {
                status { isOk() }
                jsonPath("$.doughMethods[0]") { value("DIRECT") }
                jsonPath("$.doughMethods[1]") { value("POOLISH") }
                jsonPath("$.doughMethods[2]") { value("BIGA") }
                jsonPath("$.yeastTypes[0]") { value("INSTANT") }
                jsonPath("$.yeastTypes[1]") { value("ACTIVE_DRY") }
                jsonPath("$.yeastTypes[2]") { value("FRESH") }
                jsonPath("$.fermentationPresets.length()") { value(5) }
            }
    }

    @Test
    fun `returns direct cold preset requirements`() {
        mockMvc.get("/api/dough/metadata")
            .andExpect {
                status { isOk() }
                jsonPath("$.fermentationPresets[2].code") {
                    value("COLD_48H")
                }
                jsonPath("$.fermentationPresets[2].compatibleDoughMethods[0]") {
                    value("DIRECT")
                }
                jsonPath("$.fermentationPresets[2].requiresRoomTemperature") {
                    value(false)
                }
                jsonPath("$.fermentationPresets[2].requiresColdTemperature") {
                    value(true)
                }
                jsonPath("$.fermentationPresets[2].coldHours") {
                    value(48.0)
                }
            }
    }

    @Test
    fun `returns preferment preset requirements`() {
        mockMvc.get("/api/dough/metadata")
            .andExpect {
                status { isOk() }
                jsonPath("$.fermentationPresets[3].code") {
                    value("POOLISH_ROOM_16H_COLD_24H")
                }
                jsonPath("$.fermentationPresets[3].compatibleDoughMethods[0]") {
                    value("POOLISH")
                }
                jsonPath("$.fermentationPresets[3].requiresRoomTemperature") {
                    value(true)
                }
                jsonPath("$.fermentationPresets[3].requiresColdTemperature") {
                    value(true)
                }
                jsonPath("$.fermentationPresets[3].roomHours") {
                    value(16.0)
                }
                jsonPath("$.fermentationPresets[3].coldHours") {
                    value(24.0)
                }
            }
    }
}
