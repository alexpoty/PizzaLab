package com.pizzalab.backend.domain.service

import com.pizzalab.backend.domain.model.dough.DoughMethod
import com.pizzalab.backend.domain.model.fermentation.FermentationMode
import com.pizzalab.backend.domain.model.fermentation.FermentationSchedule
import com.pizzalab.backend.domain.model.yeast.YeastType
import kotlin.test.Test
import kotlin.test.assertEquals

class YeastCalculatorTest {
    private val calculator = YeastCalculator()

    @Test
    fun `uses calibrated direct cold formula at reference temperature`() {
        val result = calculator.calculateYeastPercent(
            schedule = FermentationSchedule(
                mode = FermentationMode.COLD,
                coldHours = 24.0,
                coldTemperatureCelsius = 5.0,
            ),
            yeastType = YeastType.FRESH,
            doughMethod = DoughMethod.DIRECT,
            hydrationPercent = 62.0,
            flourGrams = 1000.0,
        )

        assertEquals(1.8, result.selectedYeastPercent, Tolerance)
        assertEquals(18.0, result.details.selectedYeastGrams, Tolerance)
        assertEquals(24.0, result.details.coldEffectHours, Tolerance)
        assertEquals(0.0, result.details.roomEffectHours, Tolerance)
        assertEquals(1.8, result.details.freshYeastPercent, Tolerance)
    }

    @Test
    fun `reduces direct cold yeast percent for longer cold fermentation`() {
        val result = calculator.calculateYeastPercent(
            schedule = FermentationSchedule(
                mode = FermentationMode.COLD,
                coldHours = 48.0,
                coldTemperatureCelsius = 5.0,
            ),
            yeastType = YeastType.FRESH,
            doughMethod = DoughMethod.DIRECT,
            hydrationPercent = 62.0,
            flourGrams = 1000.0,
        )

        assertEquals(0.7, result.selectedYeastPercent, Tolerance)
        assertEquals(7.0, result.details.selectedYeastGrams, Tolerance)
        assertEquals(48.0, result.details.coldEffectHours, Tolerance)
    }

    @Test
    fun `converts mixed fermentation schedule into effective yeast activity hours`() {
        val result = calculator.calculateYeastPercent(
            schedule = FermentationSchedule(
                mode = FermentationMode.MIXED,
                roomHours = 2.0,
                roomTemperatureCelsius = 20.0,
                coldHours = 24.0,
                coldTemperatureCelsius = 4.0,
            ),
            yeastType = YeastType.INSTANT,
            doughMethod = DoughMethod.DIRECT,
            hydrationPercent = 60.0,
            flourGrams = 1000.0,
        )

        assertEquals(1.4142, result.details.roomEffectHours, Tolerance)
        assertEquals(5.76, result.details.coldEffectHours, Tolerance)
        assertEquals(7.1742, result.details.effectiveFermentationHours, Tolerance)
        assertEquals(0.18, result.details.freshYeastPercent, Tolerance)
        assertEquals(0.06, result.selectedYeastPercent, Tolerance)
        assertEquals(0.6, result.details.selectedYeastGrams, Tolerance)
    }

    @Test
    fun `applies preferment method factor to standard yeast calculation`() {
        val result = calculator.calculateYeastPercent(
            schedule = FermentationSchedule(
                mode = FermentationMode.ROOM,
                roomHours = 12.0,
                roomTemperatureCelsius = 20.0,
            ),
            yeastType = YeastType.INSTANT,
            doughMethod = DoughMethod.POOLISH,
            hydrationPercent = 65.0,
            flourGrams = 1000.0,
        )

        assertEquals(0.75, result.details.methodFactor, Tolerance)
        assertEquals(0.1616, result.details.freshYeastPercentBeforeMethodFactor, Tolerance)
        assertEquals(0.1212, result.details.freshYeastPercent, Tolerance)
        assertEquals(0.0404, result.selectedYeastPercent, Tolerance)
        assertEquals(0.4041, result.details.selectedYeastGrams, Tolerance)
    }

    private companion object {
        const val Tolerance = 0.0001
    }
}
