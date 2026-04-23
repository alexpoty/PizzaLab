package com.pizzalab.backend.api.recipe

import com.pizzalab.backend.persistence.recipe.RecipeJdbcRepository
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class RecipeControllerTest(
    @param:Autowired private val mockMvc: MockMvc,
    @param:Autowired private val recipeRepository: RecipeJdbcRepository,
) {
    @BeforeEach
    fun clearRecipes() {
        recipeRepository.deleteAll()
    }

    @Test
    fun `creates and lists saved recipes`() {
        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "24h direct dough",
                  "formula": {
                    "pizzaCount": 4,
                    "doughBallWeightGrams": 250,
                    "hydrationPercent": 65,
                    "saltPercent": 2.8,
                    "yeastType": "INSTANT",
                    "doughMethod": "DIRECT",
                    "fermentationPreset": "ROOM_24H",
                    "roomTemperatureCelsius": 20
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.id") { exists() }
                jsonPath("$.name") { value("24h direct dough") }
                jsonPath("$.formula.pizzaCount") { value(4) }
                jsonPath("$.formula.doughBallWeightGrams") { value(250.0) }
                jsonPath("$.formula.hydrationPercent") { value(65.0) }
                jsonPath("$.formula.saltPercent") { value(2.8) }
                jsonPath("$.formula.yeastType") { value("INSTANT") }
                jsonPath("$.formula.doughMethod") { value("DIRECT") }
                jsonPath("$.formula.fermentationPreset") { value("ROOM_24H") }
                jsonPath("$.formula.roomTemperatureCelsius") { value(20.0) }
                jsonPath("$.createdAt") { exists() }
            }

        mockMvc.get("/api/recipes")
            .andExpect {
                status { isOk() }
                jsonPath("$", hasSize<Any>(1))
                jsonPath("$[0].name") { value("24h direct dough") }
                jsonPath("$[0].formula.doughMethod") { value("DIRECT") }
            }
    }

    @Test
    fun `saves manual fermentation schedule fields`() {
        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Poolish mixed schedule",
                  "formula": {
                    "pizzaCount": 4,
                    "doughBallWeightGrams": 250,
                    "hydrationPercent": 65,
                    "saltPercent": 2.8,
                    "yeastType": "INSTANT",
                    "doughMethod": "POOLISH",
                    "prefermentFlourPercent": 30,
                    "fermentationSchedule": {
                      "mode": "MIXED",
                      "roomHours": 16,
                      "roomTemperatureCelsius": 20,
                      "coldHours": 24,
                      "coldTemperatureCelsius": 4
                    }
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.formula.doughMethod") { value("POOLISH") }
                jsonPath("$.formula.prefermentFlourPercent") { value(30.0) }
                jsonPath("$.formula.fermentationSchedule.mode") { value("MIXED") }
                jsonPath("$.formula.fermentationSchedule.roomHours") { value(16.0) }
                jsonPath("$.formula.fermentationSchedule.roomTemperatureCelsius") { value(20.0) }
                jsonPath("$.formula.fermentationSchedule.coldHours") { value(24.0) }
                jsonPath("$.formula.fermentationSchedule.coldTemperatureCelsius") { value(4.0) }
            }
    }

    @Test
    fun `deletes saved recipe`() {
        val createResult = mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Delete me",
                  "formula": {
                    "pizzaCount": 2,
                    "doughBallWeightGrams": 260,
                    "hydrationPercent": 62,
                    "saltPercent": 3,
                    "yeastType": "FRESH",
                    "doughMethod": "DIRECT",
                    "fermentationPreset": "COLD_24H",
                    "coldTemperatureCelsius": 5
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
            }
            .andReturn()

        val id = Regex(""""id":"([^"]+)"""")
            .find(createResult.response.contentAsString)
            ?.groupValues
            ?.get(1)
            ?: error("Recipe id was not returned")

        mockMvc.delete("/api/recipes/$id")
            .andExpect {
                status { isNoContent() }
            }

        mockMvc.get("/api/recipes")
            .andExpect {
                status { isOk() }
                jsonPath("$", hasSize<Any>(0))
            }
    }

    @Test
    fun `returns validation error for invalid recipe payload`() {
        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "",
                  "formula": {
                    "pizzaCount": 0,
                    "doughBallWeightGrams": 250,
                    "hydrationPercent": 65,
                    "saltPercent": 2.8,
                    "yeastType": "INSTANT"
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") { exists() }
            }
    }
}
