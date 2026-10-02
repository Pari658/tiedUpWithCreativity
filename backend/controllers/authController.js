import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { ENV } from '../lib/env.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendVerificationEmail } from '../services/brevo.js'

// ── Token Lifetimes ──────────────────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const OTP_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

// ── Cookie config (refresh token only) ───────────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const signAccessToken = (user) => {
  return jwt.sign(
    { sub: user.user_id, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )
}

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex')

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const sanitizeUser = (user) => {
  const { hashed_password, ...rest } = user
  return rest
}

/**
 * Generate a 6-digit numeric OTP.
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Save a hashed refresh token to the database.
 */
const saveRefreshToken = async (userId, rawToken, familyId) => {
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString()

  const { error } = await supabaseAdmin.from('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    family_id: familyId,
    expires_at: expiresAt,
  })

  if (error) throw error
}

/**
 * Create both tokens, persist the refresh token, and set it as a cookie.
 * Returns { accessToken, user } for the response body.
 */
const issueTokenPair = async (res, user) => {
  const accessToken = signAccessToken(user)
  const refreshToken = generateRefreshToken()
  const familyId = crypto.randomUUID()

  await saveRefreshToken(user.user_id, refreshToken, familyId)

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)

  return { accessToken, user: sanitizeUser(user) }
}

/**
 * Invalidate existing codes for a user and create + send a new OTP.
 */
const createAndSendOtp = async (user) => {
  // Invalidate any previous unused codes for this user
  await supabaseAdmin
    .from('verification_codes')
    .update({ used: true })
    .eq('user_id', user.user_id)
    .eq('used', false)

  // Generate, hash, and store
  const code = generateOtp()
  const codeHash = hashToken(code)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS).toISOString()

  const { error } = await supabaseAdmin.from('verification_codes').insert({
    user_id: user.user_id,
    code_hash: codeHash,
    expires_at: expiresAt,
  })

  if (error) throw error

  // Send via Brevo
  const firstName = user.name.split(' ')[0]
  await sendVerificationEmail(user.email, firstName, code)
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('user_id, is_verified')
    .eq('email', email)
    .maybeSingle()

  if (existingUser && existingUser.is_verified) {
    throw new AppError(409, 'An account with this email already exists', 'email')
  }

  // If user exists but isn't verified, resend OTP instead of creating a duplicate
  if (existingUser && !existingUser.is_verified) {
    const { data: fullUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', existingUser.user_id)
      .single()

    await createAndSendOtp(fullUser)
    return res.status(200).json({ needsVerification: true, email })
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
      is_blocked: false,
      is_verified: false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'An account with this email already exists', 'email')
    }
    throw error
  }

  // Generate and send OTP — don't issue tokens yet
  await createAndSendOtp(user)

  res.status(201).json({ needsVerification: true, email })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    throw new AppError(400, 'Email and verification code are required')
  }

  // Find user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (!user) throw new AppError(404, 'User not found')

  if (user.is_verified) {
    throw new AppError(400, 'Email is already verified')
  }

  // Look up valid (unused, non-expired) codes for this user
  const codeHash = hashToken(code)

  const { data: storedCode } = await supabaseAdmin
    .from('verification_codes')
    .select('*')
    .eq('user_id', user.user_id)
    .eq('code_hash', codeHash)
    .eq('used', false)
    .maybeSingle()

  if (!storedCode) {
    throw new AppError(400, 'Invalid verification code')
  }

  if (new Date(storedCode.expires_at) < new Date()) {
    throw new AppError(400, 'Verification code has expired — request a new one')
  }

  // Mark code as used
  await supabaseAdmin
    .from('verification_codes')
    .update({ used: true })
    .eq('id', storedCode.id)

  // Mark user as verified
  await supabaseAdmin
    .from('users')
    .update({ is_verified: true })
    .eq('user_id', user.user_id)

  // Now issue tokens — user is fully verified
  const updatedUser = { ...user, is_verified: true }
  const payload = await issueTokenPair(res, updatedUser)
  res.status(200).json(payload)
})

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) throw new AppError(400, 'Email is required')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (!user) throw new AppError(404, 'No account found with this email')

  if (user.is_verified) {
    throw new AppError(400, 'Email is already verified')
  }

  await createAndSendOtp(user)

  res.status(200).json({ message: 'Verification code sent' })
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

  // If not verified, resend OTP and tell frontend to redirect
  if (!user.is_verified) {
    await createAndSendOtp(user)
    return res.status(200).json({ needsVerification: true, email })
  }

  const payload = await issueTokenPair(res, user)
  res.status(200).json(payload)
})

export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken
  if (!rawToken) throw new AppError(401, 'No refresh token')

  const tokenHash = hashToken(rawToken)

  // Look up the token
  const { data: storedToken } = await supabaseAdmin
    .from('refresh_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!storedToken) {
    throw new AppError(401, 'Invalid refresh token')
  }

  // If already revoked → possible reuse attack, revoke the entire family
  if (storedToken.revoked) {
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked: true })
      .eq('family_id', storedToken.family_id)

    res.clearCookie('refreshToken', {
      httpOnly: REFRESH_COOKIE_OPTIONS.httpOnly,
      secure: REFRESH_COOKIE_OPTIONS.secure,
      sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
      path: REFRESH_COOKIE_OPTIONS.path,
    })
    throw new AppError(401, 'Refresh token reuse detected — session revoked')
  }

  // Check expiry
  if (new Date(storedToken.expires_at) < new Date()) {
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked: true })
      .eq('id', storedToken.id)

    res.clearCookie('refreshToken', {
      httpOnly: REFRESH_COOKIE_OPTIONS.httpOnly,
      secure: REFRESH_COOKIE_OPTIONS.secure,
      sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
      path: REFRESH_COOKIE_OPTIONS.path,
    })
    throw new AppError(401, 'Refresh token expired')
  }

  // Revoke old token (rotation)
  await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('id', storedToken.id)

  // Fetch user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', storedToken.user_id)
    .maybeSingle()

  if (!user) throw new AppError(401, 'User not found')

  if (user.is_blocked) {
    throw new AppError(403, 'You are blocked by admin')
  }

  // Issue a new pair — keep the same family
  const accessToken = signAccessToken(user)
  const newRefreshToken = generateRefreshToken()

  await saveRefreshToken(user.user_id, newRefreshToken, storedToken.family_id)

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS)
  res.status(200).json({ accessToken })
})

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken

  if (rawToken) {
    const tokenHash = hashToken(rawToken)

    // Revoke this specific token
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked: true })
      .eq('token_hash', tokenHash)
  }

  res.clearCookie('refreshToken', {
    httpOnly: REFRESH_COOKIE_OPTIONS.httpOnly,
    secure: REFRESH_COOKIE_OPTIONS.secure,
    sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
    path: REFRESH_COOKIE_OPTIONS.path,
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
