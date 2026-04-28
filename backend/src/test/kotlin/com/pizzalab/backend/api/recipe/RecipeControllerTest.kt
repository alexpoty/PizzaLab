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
        mockMvc.createRecipe(directRecipePayload(name = "24h direct dough"))
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
        mockMvc.createRecipe(poolishSchedulePayload())
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
        val createResult = mockMvc.createRecipe(
            directRecipePayload(
                name = "Delete me",
                pizzaCount = 2,
                doughBallWeightGrams = 260,
                hydrationPercent = 62,
                saltPercent = 3,
                yeastType = "FRESH",
                fermentationPreset = "COLD_24H",
                temperatureField = "\"coldTemperatureCelsius\": 5",
            ),
        )
            .andExpect {
                status { isOk() }
            }
            .andReturn()

        val id = createResult.recipeId()

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
        val createResult = mockMvc.createRecipe(directRecipePayload(name = "Original dough"))
            .andExpect {
                status { isOk() }
            }
            .andReturn()

        val id = createResult.recipeId()

        mockMvc.updateRecipe(id, updatedPoolishPayload())
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
        mockMvc.updateRecipe(UUID.randomUUID().toString(), directRecipePayload(name = "Missing recipe"))
            .andExpect {
                status { isNotFound() }
            }
    }

    @Test
    fun `returns validation error for invalid recipe payload`() {
        mockMvc.createRecipe(invalidRecipePayload())
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") { exists() }
            }
    }

    @Test
    fun `returns validation error when recipe name exceeds database limit`() {
        val recipeName = "a".repeat(121)

        mockMvc.createRecipe(directRecipePayload(name = recipeName))
            .andExpect {
                status { isBadRequest() }
                jsonPath("$.message") { exists() }
            }
    }

    @Test
    fun `returns validation error when recipe formula has no fermentation source`() {
        mockMvc.createRecipe(missingFermentationPayload())
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
        mockMvc.createRecipe(largeFormulaPayload())
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

private fun MockMvc.createRecipe(content: String) = post("/api/recipes") {
    contentType = MediaType.APPLICATION_JSON
    this.content = content
}

private fun MockMvc.updateRecipe(id: String, content: String) = put("/api/recipes/$id") {
    contentType = MediaType.APPLICATION_JSON
    this.content = content
}

private fun org.springframework.test.web.servlet.MvcResult.recipeId(): String {
    return Regex(""""id":"([^"]+)"""")
        .find(response.contentAsString)
        ?.groupValues
        ?.get(1)
        ?: error("Recipe id was not returned")
}

private fun directRecipePayload(
    name: String,
    pizzaCount: Int = 4,
    doughBallWeightGrams: Int = 250,
    hydrationPercent: Int = 65,
    saltPercent: Number = 2.8,
    yeastType: String = "INSTANT",
    fermentationPreset: String = "ROOM_24H",
    temperatureField: String = "\"roomTemperatureCelsius\": 20",
): String = """
    {
      "name": "$name",
      "formula": {
        "pizzaCount": $pizzaCount,
        "doughBallWeightGrams": $doughBallWeightGrams,
        "hydrationPercent": $hydrationPercent,
        "saltPercent": $saltPercent,
        "yeastType": "$yeastType",
        "doughMethod": "DIRECT",
        "fermentationPreset": "$fermentationPreset",
        $temperatureField
      }
    }
""".trimIndent()

private fun poolishSchedulePayload(): String = """
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

private fun updatedPoolishPayload(): String = """
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

private fun invalidRecipePayload(): String = """
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

private fun missingFermentationPayload(): String = """
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

private fun largeFormulaPayload(): String = """
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
