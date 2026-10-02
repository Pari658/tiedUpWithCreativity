import { Router } from 'express'
import { signup, login, logout, refresh, verifyEmail, resendOtp, getMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.post('/verify-email', verifyEmail)
router.post('/resend-otp', resendOtp)
router.get('/me', requireAuth, getMe)

export default router
