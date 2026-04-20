package com.pizzalab.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PizzaLabApplication

fun main(args: Array<String>) {
    runApplication<PizzaLabApplication>(*args)
}
