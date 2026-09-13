import { Router } from 'express'
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon, validateCoupon } from '../controllers/coupon.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()

router.get('/', requireAuth, requireAdmin, getCoupons)
router.post('/', requireAuth, requireAdmin, createCoupon)
router.patch('/:id/toggle', requireAuth, requireAdmin, toggleCoupon)
router.delete('/:id', requireAuth, requireAdmin, deleteCoupon)
router.post('/validate', requireAuth, validateCoupon)

export default router
