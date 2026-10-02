
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// ==========================================
// 1. DASHBOARD SUMMARY
// ==========================================

export const getDashboard = asyncHandler(async (req, res) => {

  const today = new Date().toISOString().split('T')[0]

  const [
    categoriesResult,
    couponsResult,
    ordersResult,
    productsResult,
    usersResult
  ] = await Promise.all([

    // Total Categories
    supabaseAdmin
      .from('category')
      .select('*', { count: 'exact', head: true }),

    // Active Coupons
    supabaseAdmin
      .from('coupons')
      .select('used_count, max_uses')
      .eq('is_active', true)
      .gte('expiry_date', today),

    // Orders
    supabaseAdmin
      .from('orders')
      .select('total_amount, payment_status, order_status'),

    // Products and Stock
    supabaseAdmin
      .from('product')
      .select('stock')
      .eq('is_active', true),

    // Total Customers
    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

  ])

  // Check database errors
  const results = [
    categoriesResult,
    couponsResult,
    ordersResult,
    productsResult,
    usersResult
  ]

  for (const result of results) {
    if (result.error) {
      throw new AppError(500, result.error.message)
    }
  }

  // 1. Total Categories
  const totalCategories = categoriesResult.count ?? 0

  // 2. Active Coupons
  const activeCoupons = (couponsResult.data ?? [])
    .filter(coupon =>
      coupon.used_count < coupon.max_uses
    ).length

  // 3. Total Orders
  const orders = ordersResult.data ?? []
  const totalOrders = orders.length

  // 4. Total Revenue
  const totalRevenue = orders
    .filter(order =>
      order.payment_status === 'paid' &&
      order.order_status !== 'cancelled'
    )
    .reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    )

  // 5. Total Products
  const products = productsResult.data ?? []
  const totalProducts = products.length

  // 6. Stock Count
  const stockCount = products.reduce(
    (sum, product) => sum + (product.stock ?? 0),
    0
  )

  // 7. Total Users
  const totalUsers = usersResult.count ?? 0

  // 8. Pending Orders
  const pendingOrders = orders.filter(
    order => order.order_status === 'placed'
  ).length

  // Final Response
  res.status(200).json({
    success: true,
    data: {
      totalCategories,
      activeCoupons,
      totalOrders,
      totalRevenue,
      totalProducts,
      stockCount,
      totalUsers,
      pendingOrders
    }
  })

})


// ==========================================
// 2. SALES REPORT
// ==========================================

export const getSalesReport = asyncHandler(async (req, res) => {

  const { from, to } = req.query

  let query = supabaseAdmin
    .from('orders')
    .select('order_id, total_amount, created_at')
    .eq('payment_status', 'paid')
    .neq('order_status', 'cancelled')
    .order('created_at', { ascending: true })

  // Optional date filters
  if (from) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) ||
        Number.isNaN(Date.parse(from))) {
      throw new AppError(400, 'Invalid from date')
    }

    query = query.gte('created_at', `${from}T00:00:00`)
  }

  if (to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(to) ||
        Number.isNaN(Date.parse(to))) {
      throw new AppError(400, 'Invalid to date')
    }

    query = query.lt(
      'created_at',
      new Date(
        Date.parse(`${to}T00:00:00Z`) + 86400000
      ).toISOString().replace('Z', '')
    )
  }

  if (from && to && from > to) {
    throw new AppError(400, 'From date must be before to date')
  }

  const { data, error } = await query

  if (error) {
    throw new AppError(500, error.message)
  }

  // Group sales by date
  const salesMap = {}

  for (const order of data ?? []) {

    const date = order.created_at.split('T')[0]

    if (!salesMap[date]) {
      salesMap[date] = {
        date,
        orders: 0,
        revenue: 0
      }
    }

    salesMap[date].orders += 1
    salesMap[date].revenue += Number(order.total_amount)
  }

  const sales = Object.values(salesMap)

  const totalRevenue = sales.reduce(
    (sum, day) => sum + day.revenue,
    0
  )

  const totalOrders = sales.reduce(
    (sum, day) => sum + day.orders,
    0
  )

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      sales
    }
  })

})
