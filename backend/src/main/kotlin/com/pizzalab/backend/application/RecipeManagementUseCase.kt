package com.pizzalab.backend.application

import com.pizzalab.backend.api.dough.toFormula
import com.pizzalab.backend.api.recipe.dto.CreateRecipeRequest
import com.pizzalab.backend.api.recipe.dto.RecipeResponse
import com.pizzalab.backend.persistence.recipe.RecipeJdbcRepository
import com.pizzalab.backend.persistence.recipe.RecipeRecord
import com.pizzalab.backend.persistence.recipe.toRecord
import com.pizzalab.backend.persistence.recipe.toResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class RecipeManagementUseCase(
    private val recipeRepository: RecipeJdbcRepository,
) {
    fun create(request: CreateRecipeRequest): RecipeResponse {
        validateFormula(request)
        return recipeRepository.save(request.toRecord()).toResponse()
    }

    fun update(id: UUID, request: CreateRecipeRequest): RecipeResponse {
        validateFormula(request)
        val existingRecipe = findRecipeOrThrow(id)
        return recipeRepository.save(request.toRecord(existingRecipe)).toResponse()
    }

    fun list(): List<RecipeResponse> {
        return recipeRepository.findAllByOrderByCreatedAtDesc().map { it.toResponse() }
    }

    fun delete(id: UUID) {
        recipeRepository.deleteById(id)
    }

    private fun validateFormula(request: CreateRecipeRequest) {
        // Recipe writes should fail with the same validation rules as live calculations.
        request.formula.toFormula()
    }

    private fun findRecipeOrThrow(id: UUID): RecipeRecord {
        return recipeRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found.")
        }
    }
}
