import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

// Valid order_status values (must match DB check constraint)
// DB allows: placed | shipped | delivered | cancelled
const ORDER_STATUSES = [
  'placed',
  'shipped',
  'delivered',
  'cancelled',
]

// Valid payment_status values (must match DB check constraint)
// DB allows: pending | paid | failed

// Valid payment_method values (must match DB check constraint)
// DB allows: wallet | credit_card | debit_card

// Statuses that allow cancellation (before fulfilment leaves the warehouse)
const CANCELLABLE_STATUSES = ['placed']

// Terminal statuses — no further updates allowed
const TERMINAL_STATUSES = ['cancelled']

// ─── GET ALL ORDERS (with filters) ──────────────────────────────────────────
// GET /api/orders
// Query params: status, payment_method, customer_id, from_date, to_date, page, limit
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    payment_method,
    customer_id,
    from_date,
    to_date,
    page = 1,
    limit = 20,
  } = req.query

  const offset = (Number(page) - 1) * Number(limit)

  let query = supabaseAdmin
    .from('orders')
    .select(
      `
      order_id,
      total_amount,
      discount_amount,
      shipping_cost,
      payment_method,
      payment_status,
      order_status,
      notes,
      created_at,
      updated_at,
      customer:user_id ( user_id, name, email, phone ),
      address:address_id ( address_line1, address_line2, city, state, pincode, country )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1)

  if (status) query = query.eq('order_status', status)
  if (payment_method) query = query.eq('payment_method', payment_method)
  if (customer_id) query = query.eq('user_id', customer_id)
  if (from_date) query = query.gte('created_at', from_date)
  if (to_date) query = query.lte('created_at', to_date)

  const { data, error, count } = await query

  if (error) throw error

  res.json({
    orders: data,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    },
  })
})

// ─── GET SINGLE ORDER DETAILS ────────────────────────────────────────────────
// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(
      `
      order_id,
      total_amount,
      discount_amount,
      shipping_cost,
      payment_method,
      payment_status,
      order_status,
      tracking_number,
      carrier,
      notes,
      created_at,
      updated_at,
      customer:user_id ( user_id, name, email, phone ),
      address:address_id ( address_line1, address_line2, city, state, pincode, country ),
      coupon:coupon_id ( code, discount )
    `
    )
    .eq('order_id', req.params.id)
    .single()

  if (orderError || !order) throw new AppError(404, 'Order not found')

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(
      `
      id,
      quantity,
      total_price,
      product:product_id (
        product_id,
        product_name,
        price
      )
    `
    )
    .eq('order_id', req.params.id)

  if (itemsError) throw itemsError

  res.json({ ...order, items })
})

// ─── UPDATE ORDER STATUS ─────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Body: { order_status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { order_status } = req.body

  if (!order_status) throw new AppError(400, 'order_status is required')
  if (!ORDER_STATUSES.includes(order_status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`)
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('order_id, order_status, user_id')
    .eq('order_id', req.params.id)
    .single()

  if (fetchError || !current) throw new AppError(404, 'Order not found')

  if (TERMINAL_STATUSES.includes(current.order_status)) {
    throw new AppError(400, `Cannot update a ${current.order_status} order`)
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ order_status, updated_at: new Date().toISOString() })
    .eq('order_id', req.params.id)
    .select()
    .single()

  if (error) throw error

  // In-app notification to customer
  await supabaseAdmin.from('notification').insert([
    {
      user_id: current.user_id,
      message: `Your order #${req.params.id.slice(0, 8).toUpperCase()} status has been updated to: ${order_status.replace(/_/g, ' ')}`,
    },
  ])

  res.json(data)
})

// ─── CANCEL ORDER (with restocking) ─────────────────────────────────────────
// PATCH /api/orders/:id/cancel
// Body: { reason? }
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('order_id, order_status, user_id, notes')
    .eq('order_id', req.params.id)
    .single()

  if (fetchError || !order) throw new AppError(404, 'Order not found')

  if (!CANCELLABLE_STATUSES.includes(order.order_status)) {
    throw new AppError(
      400,
      `Cannot cancel an order with status "${order.order_status}". Only pending or confirmed orders can be cancelled.`
    )
  }

  // Fetch items to restock
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', req.params.id)

  if (itemsError) throw itemsError

  // Restock each product
  for (const item of items) {
    const { data: product, error: productError } = await supabaseAdmin
      .from('product')
      .select('stock')
      .eq('product_id', item.product_id)
      .single()

    if (!productError && product) {
      await supabaseAdmin
        .from('product')
        .update({ stock: product.stock + item.quantity })
        .eq('product_id', item.product_id)
    }
  }

  const cancellationNote = reason ? `[CANCELLED] ${reason}` : '[CANCELLED by admin]'
  const updatedNotes = order.notes ? `${order.notes}\n${cancellationNote}` : cancellationNote

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      order_status: 'cancelled',
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', req.params.id)
    .select()
    .single()

  if (error) throw error

  // Notify customer
  await supabaseAdmin.from('notification').insert([
    {
      user_id: order.user_id,
      message: `Your order #${req.params.id.slice(0, 8).toUpperCase()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    },
  ])

  res.json({ message: 'Order cancelled and inventory restocked', order: data })
})

// ─── MARK REFUND ─────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/refund
// Body: { refund_note? }
// No payment gateway — just marks payment_status and order_status as refunded
export const markRefund = asyncHandler(async (req, res) => {
  const { refund_note } = req.body

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('order_id, order_status, user_id, notes')
    .eq('order_id', req.params.id)
    .single()

  if (fetchError || !order) throw new AppError(404, 'Order not found')

  // DB payment_status constraint: pending | paid | failed
  // Since there is no 'refunded' DB value yet, we use:
  //   payment_status = 'failed'  (closest available value meaning money did not stay with merchant)
  //   order_status   = 'cancelled' (already is, or remains as-is if delivered)
  // A [REFUND ISSUED] audit note is appended to the notes field.
  const REFUNDABLE_STATUSES = ['cancelled', 'delivered']
  if (!REFUNDABLE_STATUSES.includes(order.order_status)) {
    throw new AppError(
      400,
      `Refunds can only be issued for cancelled or delivered orders. Current status: "${order.order_status}"`
    )
  }

  const refundNote = refund_note ? `[REFUND ISSUED] ${refund_note}` : '[REFUND ISSUED by admin]'
  const updatedNotes = order.notes ? `${order.notes}\n${refundNote}` : refundNote

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed', // closest DB-allowed value to indicate refund (no 'refunded' in constraint yet)
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', req.params.id)
    .select()
    .single()

  if (error) throw error

  // Notify customer
  await supabaseAdmin.from('notification').insert([
    {
      user_id: order.user_id,
      message: `A refund has been initiated for your order #${req.params.id.slice(0, 8).toUpperCase()}.`,
    },
  ])

  res.json({ message: 'Refund marked successfully', order: data })
})

// ─── ADD / UPDATE ADMIN NOTES ─────────────────────────────────────────────────
// PATCH /api/orders/:id/notes
// Body: { notes }
export const updateAdminNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body

  if (notes === undefined || notes === null) {
    throw new AppError(400, 'notes field is required')
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('order_id')
    .eq('order_id', req.params.id)
    .single()

  if (fetchError || !existing) throw new AppError(404, 'Order not found')

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('order_id', req.params.id)
    .select('order_id, notes, updated_at')
    .single()

  if (error) throw error

  res.json(data)
})

// ─── ORDER STATS ──────────────────────────────────────────────────────────────
// GET /api/orders/stats
// Returns per-status count summary for dashboard widgets
export const getOrderStats = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('order_status')

  if (error) throw error

  const stats = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = 0
    return acc
  }, {})

  for (const row of data) {
    if (stats[row.order_status] !== undefined) {
      stats[row.order_status]++
    }
  }

  stats.total = data.length

  res.json(stats)
})
