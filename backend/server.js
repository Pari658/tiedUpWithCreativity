import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ENV } from './lib/env.js'
import { errorHandler } from './utils/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import userRoutes from './routes/user.routes.js'
import cartRoutes from './routes/cart.routes.js'
import reviewRoutes from './routes/review.routes.js'
import adminDashboardRoutes from './routes/adminDashboard.routes.js'
import customerManagementRoutes from './routes/customerManagement.routes.js'
import orderRoutes from './routes/order.routes.js'

const app = express()

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin/dashboard', adminDashboardRoutes)
app.use('/api/admin/customers', customerManagementRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/checkout', orderRoutes)
app.use('/api/v1/checkout', orderRoutes)


// Global error handler — MUST be after all routes
app.use(errorHandler)

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`)
})
