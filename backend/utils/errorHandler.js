export function errorHandler(err, req, res, next) {
  // If it's our AppError, use its status/message/field
  if (err.isOperational) {
    const body = { error: err.message }
    if (err.field) body.field = err.field
    return res.status(err.statusCode).json(body)
  }

  // Postgres unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with this value already exists', field: err.detail })
  }

  // Unexpected errors
  console.error('Unexpected error:', err)
  res.status(500).json({ error: 'Internal server error' })
}
