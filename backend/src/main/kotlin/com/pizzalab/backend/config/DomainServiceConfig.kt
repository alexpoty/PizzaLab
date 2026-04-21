package com.pizzalab.backend.config

import com.pizzalab.backend.domain.service.DoughCalculator
import com.pizzalab.backend.domain.service.YeastCalculator
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class DomainServiceConfig {
    /**
     * Provides the pure domain yeast calculator to Spring without annotating the domain class.
     */
    @Bean
    fun yeastCalculator(): YeastCalculator = YeastCalculator()

    /**
     * Wires the dough calculator with its yeast dependency while keeping domain classes framework-free.
     */
    @Bean
    fun doughCalculator(yeastCalculator: YeastCalculator): DoughCalculator =
        DoughCalculator(yeastCalculator)
}
