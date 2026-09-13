export class AppError extends Error {
  constructor(statusCode, message, field = null) {
    super(message)
    this.statusCode = statusCode
    this.field = field
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}
