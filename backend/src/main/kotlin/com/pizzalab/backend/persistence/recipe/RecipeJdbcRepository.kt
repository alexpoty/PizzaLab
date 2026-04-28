package com.pizzalab.backend.persistence.recipe

import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface RecipeJdbcRepository : CrudRepository<RecipeRecord, UUID> {
    fun findAllByOrderByCreatedAtDesc(): List<RecipeRecord>
}
