package com.pizzalab.backend.api.common

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

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

    /**
     * Converts malformed JSON and enum parsing failures into HTTP 400 responses.
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleUnreadableMessage(exception: HttpMessageNotReadableException): ApiErrorResponse {
        return ApiErrorResponse("Invalid request payload.")
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(exception: ResponseStatusException): ResponseEntity<ApiErrorResponse> {
        return ResponseEntity
            .status(exception.statusCode)
            .body(ApiErrorResponse(exception.reason ?: "Request failed."))
    }
}
