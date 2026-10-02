import { Router } from 'express'
import {
  getCustomers,
  getCustomerOrders,
  updateCustomerBlockStatus
} from '../controllers/customerManagement.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()
router.patch(
  '/:userId/block',
  requireAuth,
  requireAdmin,
  updateCustomerBlockStatus
)
router.get('/', requireAuth, requireAdmin, getCustomers)
router.get('/:userId/orders', requireAuth, requireAdmin, getCustomerOrders)
export default router