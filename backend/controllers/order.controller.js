import jwt from 'jsonwebtoken'
import { ENV } from '../lib/env.js'
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

// Valid payment_method values (must match DB check constraint)
// DB allows: UPI | credit_card | debit_card | net_banking | wallet | COD
const CHECKOUT_PAYMENT_METHODS = ['COD', 'UPI']

// Statuses that allow cancellation (before fulfilment leaves the warehouse)
const CANCELLABLE_STATUSES = ['placed']

// Terminal statuses — no further updates allowed
const TERMINAL_STATUSES = ['cancelled']

// ─── HELPER: CALCULATE BILL FROM DATABASE ─────────────────────────────────
// Ensures all prices, discounts, and totals are computed server-side
export const calculateBillFromDb = async ({ items, userId, couponCode, shippingCost }) => {
  let itemsToProcess = []

  if (items && Array.isArray(items) && items.length > 0) {
    itemsToProcess = items
  } else {
    // Fetch from user's cart
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('cart')
      .select('cart_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cart) {
      throw new AppError(400, 'Your cart is empty')
    }

    const { data: cartItems, error: itemsError } = await supabaseAdmin
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', cart.cart_id)

    if (itemsError) throw itemsError
    if (!cartItems || cartItems.length === 0) {
      throw new AppError(400, 'Your cart is empty')
    }

    itemsToProcess = cartItems
  }

  // Consolidate duplicate product_ids
  const consolidated = {}
  for (const item of itemsToProcess) {
    const pid = item.product_id || item.productId
    const qty = Number(item.quantity || 1)
    if (!pid) throw new AppError(400, 'Missing product ID in items')
    if (isNaN(qty) || qty <= 0) throw new AppError(400, 'Quantity must be a positive integer')
    consolidated[pid] = (consolidated[pid] || 0) + qty
  }

  const pids = Object.keys(consolidated)
  if (pids.length === 0) {
    throw new AppError(400, 'No items provided for checkout')
  }

  // Fetch product data from DB
  const { data: products, error: prodError } = await supabaseAdmin
    .from('product')
    .select('product_id, product_name, price, stock, is_active')
    .in('product_id', pids)

  if (prodError) throw prodError

  // Fetch primary images
  const { data: images, error: imgError } = await supabaseAdmin
    .from('product_images')
    .select('product_id, image_url, is_primary')
    .in('product_id', pids)

  if (imgError) throw imgError

  let subtotal = 0
  const processedItems = []

  for (const pid of pids) {
    const product = products.find((p) => p.product_id === pid)
    if (!product) {
      throw new AppError(404, `Product not found: ${pid}`)
    }
    if (!product.is_active) {
      throw new AppError(400, `Product "${product.product_name}" is no longer available`)
    }

    const quantity = consolidated[pid]
    const price = Number(product.price)
    const itemTotal = price * quantity
    subtotal += itemTotal

    const productImages = (images || []).filter((img) => img.product_id === pid)
    const primaryImg = productImages.find((img) => img.is_primary) || productImages[0]

    processedItems.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price,
      quantity,
      total_price: itemTotal,
      stock: product.stock,
      is_stock_sufficient: product.stock >= quantity,
      image_url: primaryImg?.image_url || null,
    })
  }

  // Handle coupon
  let validatedCoupon = null
  let discountAmount = 0

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const cleanedCode = couponCode.trim().toUpperCase()
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', cleanedCode)
      .maybeSingle()

    if (couponError || !coupon) {
      throw new AppError(400, `Invalid coupon code: "${cleanedCode}"`)
    }

    if (!coupon.is_active) {
      throw new AppError(400, `Coupon "${cleanedCode}" is inactive`)
    }

    // Expiry check (comparing YYYY-MM-DD against today's date)
    const todayStr = new Date().toISOString().split('T')[0]
    if (coupon.expiry_date < todayStr) {
      throw new AppError(400, `Coupon "${cleanedCode}" has expired`)
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      throw new AppError(400, `Coupon "${cleanedCode}" usage limit reached`)
    }

    const discountPercent = Number(coupon.discount)
    discountAmount = Math.min(subtotal, Math.round((subtotal * discountPercent) / 100))
    validatedCoupon = {
      id: coupon.id,
      code: coupon.code,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
    }
  }

  // Shipping charge: 60 default if items exist, or specified value
  const shippingCharge =
    processedItems.length > 0
      ? shippingCost !== undefined && !isNaN(Number(shippingCost))
        ? Number(shippingCost)
        : 60
      : 0

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge)

  return {
    items: processedItems,
    subtotal,
    coupon: validatedCoupon,
    discount_amount: discountAmount,
    shipping_cost: shippingCharge,
    final_total: finalTotal,
    payment_methods: CHECKOUT_PAYMENT_METHODS,
  }
}

// ─── CALCULATE CHECKOUT BILL (Buy Now or Cart) ────────────────────────────────
// POST /api/orders/checkout or POST /api/checkout
export const calculateCheckoutBill = asyncHandler(async (req, res) => {
  const { items, from_cart, coupon_code, shipping_cost } = req.body

  const bill = await calculateBillFromDb({
    items: from_cart ? null : items,
    userId: req.user.id,
    couponCode: coupon_code,
    shippingCost: shipping_cost,
  })

  res.json(bill)
})

// ─── GENERATE UPI PAYMENT ────────────────────────────────────────────────────
// POST /api/orders/payment/upi/generate
export const generateUpiPayment = asyncHandler(async (req, res) => {
  const { items, from_cart, coupon_code, shipping_cost, address_id } = req.body

  // Calculate bill from database values
  const bill = await calculateBillFromDb({
    items: from_cart ? null : items,
    userId: req.user.id,
    couponCode: coupon_code,
    shippingCost: shipping_cost,
  })

  // Verify stock sufficiency for all items
  for (const item of bill.items) {
    if (!item.is_stock_sufficient) {
      throw new AppError(
        400,
        `Insufficient stock for "${item.product_name}". Available: ${item.stock}, Requested: ${item.quantity}`
      )
    }
  }

  const transactionId = `UPI_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const payeeVpa = ENV.UPI_VPA || 'twc@upi'
  const payeeName = 'Tied Up With Creativity'

  // Cryptographically sign the payment intent token (15m expiry)
  const paymentToken = jwt.sign(
    {
      type: 'upi_intent',
      transaction_id: transactionId,
      user_id: req.user.id,
      amount: bill.final_total,
      address_id: address_id || null,
      coupon_code: coupon_code || null,
      from_cart: Boolean(from_cart),
      items: bill.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      created_at: Date.now(),
    },
    ENV.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const upiUri = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${bill.final_total}&tr=${transactionId}&cu=INR&tn=Order%20Payment`

  res.json({
    payment_method: 'UPI',
    transaction_id: transactionId,
    amount: bill.final_total,
    payee_vpa: payeeVpa,
    payee_name: payeeName,
    upi_uri: upiUri,
    payment_token: paymentToken,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    bill: {
      subtotal: bill.subtotal,
      discount_amount: bill.discount_amount,
      shipping_cost: bill.shipping_cost,
      final_total: bill.final_total,
    },
  })
})

// ─── VERIFY UPI PAYMENT ──────────────────────────────────────────────────────
// POST /api/orders/payment/upi/verify
export const verifyUpiPayment = asyncHandler(async (req, res) => {
  const { transaction_id, payment_token, upi_ref_no } = req.body

  if (!transaction_id) {
    throw new AppError(400, 'transaction_id is required')
  }
  if (!payment_token) {
    throw new AppError(400, 'payment_token is required')
  }

  let decoded
  try {
    decoded = jwt.verify(payment_token, ENV.JWT_SECRET)
  } catch (err) {
    throw new AppError(400, 'Invalid or expired payment token')
  }

  if (decoded.user_id !== req.user.id) {
    throw new AppError(403, 'Payment token does not belong to the authenticated user')
  }
  if (decoded.transaction_id !== transaction_id) {
    throw new AppError(400, 'Transaction ID does not match payment token')
  }

  const verificationToken = jwt.sign(
    {
      type: 'upi_verified',
      transaction_id,
      user_id: req.user.id,
      amount: decoded.amount,
      upi_ref_no: upi_ref_no || `REF_${Date.now()}`,
      verified: true,
    },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.json({
    success: true,
    message: 'UPI payment verified successfully',
    transaction_id,
    amount: decoded.amount,
    verification_token: verificationToken,
  })
})

// ─── CONFIRM ORDER (Place Order with Atomic Stock Decrement) ─────────────────
// POST /api/orders or POST /api/orders/confirm
export const confirmOrder = asyncHandler(async (req, res) => {
  const {
    items,
    from_cart,
    address_id,
    coupon_code,
    payment_method,
    payment_details,
    shipping_cost,
    notes,
  } = req.body

  // 1. Validate payment method
  if (!payment_method || !CHECKOUT_PAYMENT_METHODS.includes(payment_method)) {
    throw new AppError(400, `Invalid payment method. Must be one of: ${CHECKOUT_PAYMENT_METHODS.join(', ')}`)
  }

  let paymentStatus = 'pending'

  // 2. UPI verification
  if (payment_method === 'UPI') {
    const token = payment_details?.verification_token || payment_details?.payment_token
    const txnId = payment_details?.transaction_id

    if (!token || !txnId) {
      throw new AppError(400, 'UPI payment details (transaction_id and payment/verification token) are required')
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET)
      if (decoded.user_id !== req.user.id) {
        throw new AppError(403, 'Payment verification user mismatch')
      }
      if (decoded.transaction_id !== txnId) {
        throw new AppError(400, 'Payment verification transaction mismatch')
      }
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(400, 'UPI payment could not be verified or has expired')
    }

    paymentStatus = 'paid'
  }

  // 3. Resolve address
  let targetAddressId = address_id
  if (!targetAddressId) {
    const { data: defaultAddress, error: addrError } = await supabaseAdmin
      .from('address')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (addrError) throw addrError
    if (!defaultAddress) {
      throw new AppError(400, 'Delivery address is required. Please provide address_id or save an address in your profile.')
    }
    targetAddressId = defaultAddress.id
  }

  // 4. Recalculate bill and verify stock from DB
  const bill = await calculateBillFromDb({
    items: from_cart ? null : items,
    userId: req.user.id,
    couponCode: coupon_code,
    shippingCost: shipping_cost,
  })

  // Check stock
  for (const item of bill.items) {
    if (!item.is_stock_sufficient) {
      throw new AppError(
        400,
        `Insufficient stock for "${item.product_name}". Available: ${item.stock}, Requested: ${item.quantity}`
      )
    }
  }

  const itemsToOrder = bill.items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }))

  const notesText =
    notes ||
    (payment_method === 'UPI' && payment_details?.transaction_id
      ? `Paid via UPI. Ref: ${payment_details.transaction_id}`
      : `Payment: ${payment_method}`)

  // 5. Atomic confirmation RPC in PostgreSQL
  const { data: createdOrderSummary, error: rpcError } = await supabaseAdmin.rpc(
    'confirm_order_atomic',
    {
      p_user_id: req.user.id,
      p_address_id: targetAddressId,
      p_payment_method: payment_method,
      p_payment_status: paymentStatus,
      p_coupon_code: bill.coupon?.code || null,
      p_shipping_cost: bill.shipping_cost,
      p_items: itemsToOrder,
      p_notes: notesText,
    }
  )

  if (rpcError) {
    throw new AppError(400, rpcError.message || 'Failed to place order')
  }

  // 6. Clear relevant cart items if purchase came from cart
  if (from_cart || (!items && bill.items.length > 0)) {
    const { data: userCart } = await supabaseAdmin
      .from('cart')
      .select('cart_id')
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (userCart) {
      const orderedProductIds = itemsToOrder.map((i) => i.product_id)
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('cart_id', userCart.cart_id)
        .in('product_id', orderedProductIds)
    }
  }

  // 7. Fetch complete order with line items
  const { data: orderDetails, error: fetchError } = await supabaseAdmin
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
      address:address_id ( address_line1, address_line2, city, state, pincode, country ),
      coupon:coupon_id ( code, discount )
    `
    )
    .eq('order_id', createdOrderSummary.order_id)
    .single()

  if (fetchError) throw fetchError

  const { data: orderItems, error: itemsError } = await supabaseAdmin
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
    .eq('order_id', createdOrderSummary.order_id)

  if (itemsError) throw itemsError

  res.status(201).json({
    message: 'Order confirmed successfully',
    order: {
      ...orderDetails,
      final_amount: orderDetails.total_amount,
      items: orderItems,
    },
  })
})

// ─── GET ALL ORDERS (with filters) ──────────────────────────────────────────
// GET /api/orders
// Query params: status, payment_method, customer_id, from_date, to_date, page, limit
export const getAllOrders = asyncHandler(async (req, res) => {
  // If customer, return their own orders
  if (req.user.role !== 'admin') {
    const { data, error } = await supabaseAdmin
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
        address:address_id ( address_line1, address_line2, city, state, pincode, country ),
        coupon:coupon_id ( code, discount )
      `
      )
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formatted = (data || []).map((order) => ({
      ...order,
      final_amount: order.total_amount,
    }))

    return res.json(formatted)
  }

  // Admin query flow
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

  if (req.user.role !== 'admin' && order.customer?.user_id !== req.user.id) {
    throw new AppError(403, 'Not authorized to view this order')
  }

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
        price,
        image_url:product_images!fk_product(image_url)
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

  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    throw new AppError(403, 'Not authorized to cancel this order')
  }

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
