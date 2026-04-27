package com.pizzalab.backend.application

import com.pizzalab.backend.api.dough.toFormula
import com.pizzalab.backend.api.recipe.dto.CreateRecipeRequest
import com.pizzalab.backend.api.recipe.dto.RecipeResponse
import com.pizzalab.backend.persistence.recipe.RecipeJdbcRepository
import com.pizzalab.backend.persistence.recipe.toRecord
import com.pizzalab.backend.persistence.recipe.toResponse
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.util.UUID

@Service
class RecipeManagementUseCase(
    private val recipeRepository: RecipeJdbcRepository,
) {
    /**
     * Coordinates recipe persistence without exposing JDBC details to the HTTP layer.
     */
    fun create(request: CreateRecipeRequest): RecipeResponse {
        request.formula.toFormula()
        return recipeRepository.save(request.toRecord()).toResponse()
    }

    fun update(id: UUID, request: CreateRecipeRequest): RecipeResponse {
        request.formula.toFormula()
        val existingRecipe = recipeRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found.")
        }
        return recipeRepository.save(request.toRecord(existingRecipe)).toResponse()
    }

    /**
     * Lists recipes in presentation order. The repository owns the database ordering detail.
     */
    fun list(): List<RecipeResponse> {
        return recipeRepository.findAllByOrderByCreatedAtDesc().map { it.toResponse() }
    }

    /**
     * Keeps delete semantics simple for clients: repeated deletes do not fail.
     */
    fun delete(id: UUID) {
        recipeRepository.deleteById(id)
    }
}
