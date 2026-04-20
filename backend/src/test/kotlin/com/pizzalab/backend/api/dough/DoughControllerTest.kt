package com.pizzalab.backend.api.dough

import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import com.pizzalab.backend.api.ApiExceptionHandler
import com.pizzalab.backend.application.CalculateDoughUseCase

@WebMvcTest(DoughController::class)
@Import(CalculateDoughUseCase::class, ApiExceptionHandler::class)
class DoughControllerTest(
    @param:Autowired private val mockMvc: MockMvc,
) {
    @Test
    fun `calculates direct dough ingredients`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "DIRECT",
                  "fermentationSchedule": {
                    "mode": "ROOM",
                    "roomHours": 8,
                    "roomTemperatureCelsius": 20
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.flourGrams") { value(595.7) }
                jsonPath("$.waterGrams") { value(387.2) }
                jsonPath("$.saltGrams") { value(16.7) }
                jsonPath("$.yeastGrams") { value(0.4) }
                jsonPath("$.preferment") { value(nullValue()) }
                jsonPath("$.finalMix.flourGrams") { value(595.7) }
                jsonPath("$.finalMix.waterGrams") { value(387.2) }
                jsonPath("$.finalMix.saltGrams") { value(16.7) }
                jsonPath("$.finalMix.yeastGrams") { value(0.4) }
            }
    }

    @Test
    fun `calculates poolish preferment and final mix`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "POOLISH",
                  "prefermentFlourPercent": 30,
                  "fermentationSchedule": {
                    "mode": "ROOM",
                    "roomHours": 12,
                    "roomTemperatureCelsius": 20
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.preferment.flourGrams") { value(178.7) }
                jsonPath("$.preferment.waterGrams") { value(178.7) }
                jsonPath("$.preferment.yeastGrams") { value(0.2) }
                jsonPath("$.finalMix.flourGrams") { value(417.1) }
                jsonPath("$.finalMix.waterGrams") { value(208.6) }
                jsonPath("$.finalMix.saltGrams") { value(16.7) }
                jsonPath("$.finalMix.yeastGrams") { value(0.0) }
            }
    }

    @Test
    fun `returns bad request when preferment water exceeds total water`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 55,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "POOLISH",
                  "prefermentFlourPercent": 80,
                  "fermentationSchedule": {
                    "mode": "ROOM",
                    "roomHours": 12,
                    "roomTemperatureCelsius": 20
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("Preferment water cannot exceed total dough water. Lower preferment flour percent or increase hydration.")
                }
            }
    }

    @Test
    fun `calculates room temperature preset`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "DIRECT",
                  "fermentationPreset": "ROOM_24H",
                  "roomTemperatureCelsius": 20
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.flourGrams") { value(595.9) }
                jsonPath("$.waterGrams") { value(387.3) }
                jsonPath("$.saltGrams") { value(16.7) }
                jsonPath("$.yeastGrams") { value(0.2) }
            }
    }

    @Test
    fun `calculates cold fermentation preset`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "DIRECT",
                  "fermentationPreset": "COLD_24H",
                  "coldTemperatureCelsius": 4
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.flourGrams") { value(595.7) }
                jsonPath("$.waterGrams") { value(387.2) }
                jsonPath("$.saltGrams") { value(16.7) }
                jsonPath("$.yeastGrams") { value(0.4) }
            }
    }

    @Test
    fun `calculates poolish room and cold fermentation preset`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "POOLISH",
                  "fermentationPreset": "POOLISH_ROOM_16H_COLD_24H",
                  "roomTemperatureCelsius": 20,
                  "coldTemperatureCelsius": 4,
                  "prefermentFlourPercent": 30
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.preferment.flourGrams") { value(178.8) }
                jsonPath("$.preferment.waterGrams") { value(178.8) }
                jsonPath("$.preferment.yeastGrams") { value(0.1) }
                jsonPath("$.finalMix.flourGrams") { value(417.1) }
                jsonPath("$.finalMix.waterGrams") { value(208.5) }
                jsonPath("$.finalMix.yeastGrams") { value(0.0) }
            }
    }

    @Test
    fun `returns bad request when poolish preset is used with direct method`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 250,
                  "hydrationPercent": 65,
                  "saltPercent": 2.8,
                  "yeastType": "INSTANT",
                  "doughMethod": "DIRECT",
                  "fermentationPreset": "POOLISH_ROOM_16H_COLD_24H",
                  "roomTemperatureCelsius": 20,
                  "coldTemperatureCelsius": 4
                }
            """.trimIndent()
        }
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("POOLISH_ROOM_16H_COLD_24H requires doughMethod POOLISH.")
                }
            }
    }
}
