import { Router } from 'express'
import multer from 'multer'
import { getProducts, createProduct } from '../controllers/product.controller.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', getProducts)
router.post('/', requireAuth, requireAdmin, upload.array('images', 10), createProduct)

export default router
