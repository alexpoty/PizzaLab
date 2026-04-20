package com.pizzalab.backend.domain.model

data class FermentationSchedule(
    val mode: FermentationMode,
    val roomHours: Double = 0.0,
    val roomTemperatureCelsius: Double = 20.0,
    val coldHours: Double = 0.0,
    val coldTemperatureCelsius: Double = 4.0,
) {
    init {
        require(roomHours >= 0) { "Room fermentation hours cannot be negative." }
        require(coldHours >= 0) { "Cold fermentation hours cannot be negative." }
        require(roomTemperatureCelsius > 0) { "Room temperature must be greater than zero." }
        require(coldTemperatureCelsius > 0) { "Cold temperature must be greater than zero." }
        require(roomHours + coldHours > 0) { "Fermentation schedule must include at least one hour." }
        require(mode != FermentationMode.ROOM || roomHours > 0) { "Room fermentation requires room hours." }
        require(mode != FermentationMode.COLD || coldHours > 0) { "Cold fermentation requires cold hours." }
        require(mode != FermentationMode.MIXED || roomHours > 0 && coldHours > 0) {
            "Mixed fermentation requires both room and cold hours."
        }
    }
}
