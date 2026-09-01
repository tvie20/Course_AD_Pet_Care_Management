import {
    StatusCodes,
    ReasonPhrases
} from '../utils/httpStatusCode.js'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZED: 401
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict error',
    UNAUTHORIZED: 'Authentication Error'
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = ReasonStatusCode.UNAUTHORIZED, statusCode = StatusCode.UNAUTHORIZED) {
        super(message, statusCode)
    }
}

export {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError
}