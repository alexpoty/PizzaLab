package com.pizzalab.backend.api.recipe

import com.pizzalab.backend.api.recipe.dto.CreateRecipeRequest
import com.pizzalab.backend.api.recipe.dto.RecipeResponse
import com.pizzalab.backend.application.RecipeManagementUseCase
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/recipes")
class RecipeController(
    private val recipeManagement: RecipeManagementUseCase,
) {
    /**
     * HTTP adapter for saving the current calculator input under a user-provided name.
     */
    @PostMapping
    fun create(@Valid @RequestBody request: CreateRecipeRequest): RecipeResponse {
        return recipeManagement.create(request)
    }

    /**
     * Returns saved recipes newest-first so recent formulas stay easy to reuse.
     */
    @GetMapping
    fun list(): List<RecipeResponse> {
        return recipeManagement.list()
    }

    /**
     * Deletes a recipe by id. Deleting an already-missing id is intentionally idempotent.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) {
        recipeManagement.delete(id)
    }
}
