import { Router } from 'express'
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()

router.get('/', getCategories)
router.post('/', requireAuth, requireAdmin, createCategory)
router.delete('/:id', requireAuth, requireAdmin, deleteCategory)

export default router
