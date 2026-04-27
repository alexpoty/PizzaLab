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
import org.springframework.test.web.servlet.put
import java.util.UUID

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
    fun `updates saved recipe`() {
        val createResult = mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Original dough",
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
            }
            .andReturn()

        val id = Regex(""""id":"([^"]+)"""")
            .find(createResult.response.contentAsString)
            ?.groupValues
            ?.get(1)
            ?: error("Recipe id was not returned")

        mockMvc.put("/api/recipes/$id") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Original dough v2",
                  "formula": {
                    "pizzaCount": 6,
                    "doughBallWeightGrams": 270,
                    "hydrationPercent": 68,
                    "saltPercent": 2.6,
                    "yeastType": "FRESH",
                    "doughMethod": "POOLISH",
                    "prefermentFlourPercent": 35,
                    "fermentationSchedule": {
                      "mode": "MIXED",
                      "roomHours": 18,
                      "roomTemperatureCelsius": 21,
                      "coldHours": 24,
                      "coldTemperatureCelsius": 4
                    }
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.id") { value(id) }
                jsonPath("$.name") { value("Original dough v2") }
                jsonPath("$.formula.pizzaCount") { value(6) }
                jsonPath("$.formula.doughBallWeightGrams") { value(270.0) }
                jsonPath("$.formula.hydrationPercent") { value(68.0) }
                jsonPath("$.formula.saltPercent") { value(2.6) }
                jsonPath("$.formula.yeastType") { value("FRESH") }
                jsonPath("$.formula.doughMethod") { value("POOLISH") }
                jsonPath("$.formula.prefermentFlourPercent") { value(35.0) }
                jsonPath("$.formula.fermentationSchedule.mode") { value("MIXED") }
                jsonPath("$.formula.fermentationSchedule.roomHours") { value(18.0) }
                jsonPath("$.formula.fermentationSchedule.roomTemperatureCelsius") { value(21.0) }
                jsonPath("$.formula.fermentationSchedule.coldHours") { value(24.0) }
                jsonPath("$.formula.fermentationSchedule.coldTemperatureCelsius") { value(4.0) }
            }

        mockMvc.get("/api/recipes")
            .andExpect {
                status { isOk() }
                jsonPath("$", hasSize<Any>(1))
                jsonPath("$[0].id") { value(id) }
                jsonPath("$[0].name") { value("Original dough v2") }
                jsonPath("$[0].formula.doughMethod") { value("POOLISH") }
            }
    }

    @Test
    fun `returns not found when updating missing recipe`() {
        mockMvc.put("/api/recipes/${UUID.randomUUID()}") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Missing recipe",
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
                status { isNotFound() }
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

    @Test
    fun `returns validation error when recipe name exceeds database limit`() {
        val recipeName = "a".repeat(121)

        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "$recipeName",
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
                status { isBadRequest() }
                jsonPath("$.message") { exists() }
            }
    }

    @Test
    fun `returns validation error when recipe formula has no fermentation source`() {
        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Missing fermentation",
                  "formula": {
                    "pizzaCount": 4,
                    "doughBallWeightGrams": 250,
                    "hydrationPercent": 65,
                    "saltPercent": 2.8,
                    "yeastType": "INSTANT",
                    "doughMethod": "DIRECT"
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") {
                    value("Either fermentationSchedule or fermentationPreset must be provided.")
                }
            }

        mockMvc.get("/api/recipes")
            .andExpect {
                status { isOk() }
                jsonPath("$", hasSize<Any>(0))
            }
    }

    @Test
    fun `persists large numeric formula values accepted by api validation`() {
        mockMvc.post("/api/recipes") {
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "name": "Large formula values",
                  "formula": {
                    "pizzaCount": 100000,
                    "doughBallWeightGrams": 1000000000,
                    "hydrationPercent": 12345.67,
                    "saltPercent": 123.45,
                    "yeastType": "INSTANT",
                    "doughMethod": "DIRECT",
                    "fermentationPreset": "ROOM_24H",
                    "roomTemperatureCelsius": 123.45
                  }
                }
            """.trimIndent()
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.formula.pizzaCount") { value(100000) }
                jsonPath("$.formula.doughBallWeightGrams") { value(1000000000.0) }
                jsonPath("$.formula.hydrationPercent") { value(12345.67) }
                jsonPath("$.formula.saltPercent") { value(123.45) }
                jsonPath("$.formula.roomTemperatureCelsius") { value(123.45) }
            }
    }
}
