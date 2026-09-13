import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { ENV } from '../lib/env.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

const signToken = (user) => {
  return jwt.sign({ sub: user.user_id, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' })
}

const sanitizeUser = (user) => {
  const { hashed_password, ...rest } = user
  return rest
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists', 'email')
  }

  const hashed_password = await bcrypt.hash(password, 12)

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      email,
      phone,
      hashed_password,
      role: 'customer',
      avatar_url: '',
      is_blocked: false
    })
    .select()
    .single()

  if (error) {
      if (error.code === '23505') {
          throw new AppError(409, 'An account with this email already exists', 'email')
      }
      throw error
  }

  const token = signToken(user)
  res.cookie('session', token, COOKIE_OPTIONS)

  res.status(201).json({ user: sanitizeUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
    throw new AppError(401, 'Invalid email or password')
  }

  if (user.is_blocked) {
    throw new AppError(403, 'You are blocked by admin')
  }

  const token = signToken(user)
  res.cookie('session', token, COOKIE_OPTIONS)

  res.status(200).json({ user: sanitizeUser(user) })
})

export const logout = asyncHandler(async (req, res) => {
  // Use the same path/domain/secure/sameSite options as COOKIE_OPTIONS
  // so the browser matches and actually clears the cookie
  res.clearCookie('session', {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: COOKIE_OPTIONS.path,
  })
  res.status(204).end()
})

export const getMe = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (error || !user) throw new AppError(404, 'User not found')

  res.status(200).json(sanitizeUser(user))
})
