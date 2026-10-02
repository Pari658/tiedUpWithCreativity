import { Router } from 'express'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markRefund,
  updateAdminNotes,
  getOrderStats,
} from '../controllers/order.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()

// All order routes are admin-only
router.use(requireAuth, requireAdmin)

router.get('/stats', getOrderStats)
router.get('/', getAllOrders)
router.get('/:id', getOrderById)
router.patch('/:id/status', updateOrderStatus)
router.patch('/:id/cancel', cancelOrder)
router.patch('/:id/refund', markRefund)
router.patch('/:id/notes', updateAdminNotes)

export default router
