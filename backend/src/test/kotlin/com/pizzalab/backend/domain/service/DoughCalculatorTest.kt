package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.DoughFormula
import com.pizzalab.backend.domain.model.DoughMethod
import com.pizzalab.backend.domain.model.FermentationMode
import com.pizzalab.backend.domain.model.FermentationSchedule
import com.pizzalab.backend.domain.model.YeastType
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class DoughCalculatorTest {
    private val calculator = DoughCalculator()

    @Test
    fun `calculates ingredient weights from baker percentages`() {
        val result = calculator.calculate(
            DoughFormula(
                pizzaCount = 4,
                doughBallWeightGrams = 250.0,
                hydrationPercent = 65.0,
                saltPercent = 2.8,
                yeastType = YeastType.INSTANT,
                doughMethod = DoughMethod.DIRECT,
                fermentationSchedule = FermentationSchedule(
                    mode = FermentationMode.ROOM,
                    roomHours = 8.0,
                    roomTemperatureCelsius = 20.0,
                ),
            ),
        )

        assertEquals(595.3, result.flourGrams)
        assertEquals(387.0, result.waterGrams)
        assertEquals(16.7, result.saltGrams)
        assertEquals(1.1, result.yeastGrams)
        assertEquals(1000.0, result.totalDoughWeightGrams)
        assertNull(result.preferment)
        assertEquals(595.3, result.finalMix.flourGrams)
        assertEquals(387.0, result.finalMix.waterGrams)
        assertEquals(16.7, result.finalMix.saltGrams)
        assertEquals(1.1, result.finalMix.yeastGrams)
    }

    @Test
    fun `calculates lower yeast for cold fermentation`() {
        val result = calculator.calculate(
            DoughFormula(
                pizzaCount = 2,
                doughBallWeightGrams = 260.0,
                hydrationPercent = 60.0,
                saltPercent = 2.5,
                yeastType = YeastType.INSTANT,
                doughMethod = DoughMethod.DIRECT,
                fermentationSchedule = FermentationSchedule(
                    mode = FermentationMode.MIXED,
                    roomHours = 2.0,
                    roomTemperatureCelsius = 20.0,
                    coldHours = 24.0,
                    coldTemperatureCelsius = 4.0,
                ),
            ),
        )

        assertEquals(0.9, result.yeastGrams)
    }

    @Test
    fun `returns poolish breakdown for preferment method`() {
        val result = calculator.calculate(
            DoughFormula(
                pizzaCount = 4,
                doughBallWeightGrams = 250.0,
                hydrationPercent = 65.0,
                saltPercent = 2.8,
                yeastType = YeastType.INSTANT,
                doughMethod = DoughMethod.POOLISH,
                fermentationSchedule = FermentationSchedule(
                    mode = FermentationMode.ROOM,
                    roomHours = 12.0,
                    roomTemperatureCelsius = 20.0,
                ),
                prefermentFlourPercent = 30.0,
            ),
        )

        val preferment = assertNotNull(result.preferment)
        assertEquals(178.7, preferment.flourGrams)
        assertEquals(178.7, preferment.waterGrams)
        assertEquals(0.5, preferment.yeastGrams)
        assertEquals(417.0, result.finalMix.flourGrams)
        assertEquals(208.5, result.finalMix.waterGrams)
        assertEquals(16.7, result.finalMix.saltGrams)
        assertEquals(0.0, result.finalMix.yeastGrams)
    }
}
