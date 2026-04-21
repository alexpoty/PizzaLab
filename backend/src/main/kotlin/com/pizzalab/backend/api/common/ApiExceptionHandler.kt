package com.pizzalab.backend.api.common

import org.springframework.http.HttpStatus
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    /**
     * Converts domain validation failures into HTTP 400 responses.
     */
    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleIllegalArgumentException(exception: IllegalArgumentException): ApiErrorResponse {
        return ApiErrorResponse(exception.message ?: "Invalid request.")
    }

    /**
     * Converts Jakarta Bean Validation failures into HTTP 400 responses.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ApiErrorResponse {
        val message = exception.bindingResult.fieldErrors.firstOrNull()?.defaultMessage
            ?: "Invalid request."
        return ApiErrorResponse(message)
    }
}
