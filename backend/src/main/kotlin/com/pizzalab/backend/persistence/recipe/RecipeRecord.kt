package com.pizzalab.backend.persistence.recipe

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Transient
import org.springframework.data.domain.Persistable
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@Table("recipes")
data class RecipeRecord(
    @Id
    @Column("id")
    private val recipeId: UUID,

    @Column("name")
    val name: String,

    @Column("pizza_count")
    val pizzaCount: Int,

    @Column("dough_ball_weight_grams")
    val doughBallWeightGrams: BigDecimal,

    @Column("hydration_percent")
    val hydrationPercent: BigDecimal,

    @Column("salt_percent")
    val saltPercent: BigDecimal,

    @Column("yeast_type")
    val yeastType: String,

    @Column("dough_method")
    val doughMethod: String,

    @Column("fermentation_preset")
    val fermentationPreset: String?,

    @Column("fermentation_schedule_mode")
    val fermentationScheduleMode: String?,

    @Column("fermentation_schedule_room_hours")
    val fermentationScheduleRoomHours: BigDecimal?,

    @Column("fermentation_schedule_cold_hours")
    val fermentationScheduleColdHours: BigDecimal?,

    @Column("fermentation_schedule_room_temperature_celsius")
    val fermentationScheduleRoomTemperatureCelsius: BigDecimal?,

    @Column("fermentation_schedule_cold_temperature_celsius")
    val fermentationScheduleColdTemperatureCelsius: BigDecimal?,

    @Column("room_temperature_celsius")
    val roomTemperatureCelsius: BigDecimal?,

    @Column("cold_temperature_celsius")
    val coldTemperatureCelsius: BigDecimal?,

    @Column("preferment_flour_percent")
    val prefermentFlourPercent: BigDecimal?,

    @Column("created_at")
    val createdAt: OffsetDateTime,
) : Persistable<UUID> {
    @Transient
    var newRecord: Boolean = false

    override fun getId(): UUID = recipeId

    override fun isNew(): Boolean = newRecord
}
