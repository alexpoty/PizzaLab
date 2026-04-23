package com.pizzalab.backend.application

import com.pizzalab.backend.api.recipe.dto.CreateRecipeRequest
import com.pizzalab.backend.api.recipe.dto.RecipeResponse
import com.pizzalab.backend.persistence.recipe.RecipeJdbcRepository
import com.pizzalab.backend.persistence.recipe.toRecord
import com.pizzalab.backend.persistence.recipe.toResponse
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class RecipeManagementUseCase(
    private val recipeRepository: RecipeJdbcRepository,
) {
    fun create(request: CreateRecipeRequest): RecipeResponse {
        return recipeRepository.save(request.toRecord()).toResponse()
    }

    fun list(): List<RecipeResponse> {
        return recipeRepository.findAllByOrderByCreatedAtDesc().map { it.toResponse() }
    }

    fun delete(id: UUID) {
        recipeRepository.deleteById(id)
    }
}
