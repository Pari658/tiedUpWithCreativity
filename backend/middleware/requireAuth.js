import jwt from 'jsonwebtoken'
import { ENV } from '../lib/env.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler((req, res, next) => {
  const token = req.cookies?.session
  if (!token) throw new AppError(401, 'Unauthorized')

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    throw new AppError(401, 'Unauthorized')
  }
})

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'))
  }
  next()
}
