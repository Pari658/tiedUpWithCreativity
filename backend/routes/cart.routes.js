import { Router } from 'express'
import { getCart, addItem, updateItemQuantity, removeItem } from '../controllers/cart.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getCart)
router.post('/items', addItem)
router.patch('/items/:id', updateItemQuantity)
router.delete('/items/:id', removeItem)

export default router
