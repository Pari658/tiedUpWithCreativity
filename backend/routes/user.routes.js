import { Router } from 'express'
import { getProfile, updateProfile, getAddress, upsertAddress } from '../controllers/user.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

router.get('/me/profile', getProfile)
router.patch('/me/profile', updateProfile)
router.get('/me/address', getAddress)
router.put('/me/address', upsertAddress)

export default router
