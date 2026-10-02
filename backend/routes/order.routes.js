import { Router } from 'express'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markRefund,
  updateAdminNotes,
  getOrderStats,
  calculateCheckoutBill,
  generateUpiPayment,
  verifyUpiPayment,
  confirmOrder,
} from '../controllers/order.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()

// All order & checkout routes require authentication
router.use(requireAuth)

// Customer / Shared routes
router.post('/checkout', calculateCheckoutBill)
router.post('/payment/upi/generate', generateUpiPayment)
router.post('/payment/upi/verify', verifyUpiPayment)
router.post('/confirm', confirmOrder)
router.post('/', confirmOrder)
router.get('/', getAllOrders)
router.get('/:id', getOrderById)
router.patch('/:id/cancel', cancelOrder)

// Admin-only routes
router.get('/stats', requireAdmin, getOrderStats)
router.patch('/:id/status', requireAdmin, updateOrderStatus)
router.patch('/:id/refund', requireAdmin, markRefund)
router.patch('/:id/notes', requireAdmin, updateAdminNotes)

export default router
