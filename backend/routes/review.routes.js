import { Router } from 'express'
import { getReviews, approveReview, deleteReview } from '../controllers/review.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()

router.get('/', requireAuth, requireAdmin, getReviews)
router.patch('/:id/approve', requireAuth, requireAdmin, approveReview)
router.delete('/:id', requireAuth, requireAdmin, deleteReview)

export default router
