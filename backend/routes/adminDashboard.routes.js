
import { Router } from 'express'

import {
  getDashboard,
  getSalesReport
} from '../controllers/adminDashboard.js'

import {
  requireAuth,
  requireAdmin
} from '../middleware/requireAuth.js'

const router = Router()

// Protect all dashboard routes
router.use(requireAuth, requireAdmin)

// Dashboard Summary
router.get('/', getDashboard)

// Sales Report
router.get('/sales', getSalesReport)

export default router
