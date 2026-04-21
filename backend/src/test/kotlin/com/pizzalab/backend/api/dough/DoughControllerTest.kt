package com.pizzalab.backend.api.dough

import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import com.pizzalab.backend.api.common.ApiExceptionHandler
import com.pizzalab.backend.application.CalculateDoughUseCase
import com.pizzalab.backend.config.DomainServiceConfig

@WebMvcTest(DoughController::class)
@Import(CalculateDoughUseCase::class, DomainServiceConfig::class, ApiExceptionHandler::class)
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
                jsonPath("$.yeastCalculation.yeastType") { value("INSTANT") }
                jsonPath("$.yeastCalculation.doughMethod") { value("DIRECT") }
                jsonPath("$.yeastCalculation.effectiveFermentationHours") { value(5.7) }
                jsonPath("$.yeastCalculation.selectedYeastGrams") { value(0.4) }
                jsonPath("$.yeastCalculation.freshYeastEquivalentGrams") { value(1.2) }
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
                jsonPath("$.yeastCalculation.doughMethod") { value("POOLISH") }
                jsonPath("$.yeastCalculation.methodFactor") { value(0.75) }
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
                jsonPath("$.yeastCalculation.effectiveFermentationHours") { value(17.0) }
                jsonPath("$.yeastCalculation.selectedYeastGrams") { value(0.2) }
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
                jsonPath("$.flourGrams") { value(593.7) }
                jsonPath("$.waterGrams") { value(385.9) }
                jsonPath("$.saltGrams") { value(16.6) }
                jsonPath("$.yeastGrams") { value(3.8) }
                jsonPath("$.yeastCalculation.coldEffectHours") { value(22.4) }
                jsonPath("$.yeastCalculation.effectiveFermentationHours") { value(22.4) }
                jsonPath("$.yeastCalculation.freshYeastPercent") { value(1.9292) }
                jsonPath("$.yeastCalculation.selectedYeastPercent") { value(0.6431) }
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
                jsonPath("$.yeastGrams") { value(4.0) }
                jsonPath("$.preferment.flourGrams") { value(178.1) }
                jsonPath("$.preferment.waterGrams") { value(178.1) }
                jsonPath("$.preferment.yeastGrams") { value(0.2) }
                jsonPath("$.finalMix.flourGrams") { value(415.5) }
                jsonPath("$.finalMix.waterGrams") { value(207.7) }
                jsonPath("$.finalMix.yeastGrams") { value(3.8) }
                jsonPath("$.yeastCalculation.roomEffectHours") { value(11.3) }
                jsonPath("$.yeastCalculation.coldEffectHours") { value(22.4) }
                jsonPath("$.yeastCalculation.effectiveFermentationHours") { value(33.7) }
                jsonPath("$.yeastCalculation.prefermentYeastGrams") { value(0.2) }
                jsonPath("$.yeastCalculation.finalMixYeastGrams") { value(3.8) }
            }
    }

    @Test
    fun `calibrates direct cold fermentation at five celsius`() {
        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 270,
                  "hydrationPercent": 62,
                  "saltPercent": 3,
                  "yeastType": "FRESH",
                  "doughMethod": "DIRECT",
                  "fermentationPreset": "COLD_24H",
                  "coldTemperatureCelsius": 5
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.yeastGrams") { value(11.7) }
                jsonPath("$.yeastCalculation.freshYeastPercent") { value(1.8) }
                jsonPath("$.yeastCalculation.selectedYeastPercent") { value(1.8) }
            }

        mockMvc.post("/api/dough/calculate") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "pizzaCount": 4,
                  "doughBallWeightGrams": 270,
                  "hydrationPercent": 62,
                  "saltPercent": 3,
                  "yeastType": "FRESH",
                  "doughMethod": "DIRECT",
                  "fermentationPreset": "COLD_48H",
                  "coldTemperatureCelsius": 5
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.yeastGrams") { value(4.6) }
                jsonPath("$.yeastCalculation.freshYeastPercent") { value(0.7) }
                jsonPath("$.yeastCalculation.selectedYeastPercent") { value(0.7) }
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
