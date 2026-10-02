import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query
  let query = supabaseAdmin
    .from('users')
    .select(`
      user_id,
      name,
      email,
      phone,
      avatar_url,
      is_blocked,
      created_at
    `)
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  if (search && search.trim()) {
    const searchTerm = search.trim()

    query = query.or(
      `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    )
  }

  const { data, error } = await query

  if (error) {
    throw new AppError(500, 'Failed to fetch customers')
  }

  res.status(200).json({
    success: true,
    data
  })
})

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { userId } = req.params

  // Check whether customer exists
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('users')
    .select('user_id, name, email')
    .eq('user_id', userId)
    .eq('role', 'customer')
    .maybeSingle()

  if (customerError) {
    throw new AppError(500, 'Failed to fetch customer')
  }

  if (!customer) {
    throw new AppError(404, 'Customer not found')
  }

  // Fetch customer's orders
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select(`
      order_id,
      total_amount,
      discount_amount,
      shipping_cost,
      payment_method,
      payment_status,
      order_status,
      tracking_number,
      carrier,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ordersError) {
    throw new AppError(500, 'Failed to fetch customer orders')
  }

  res.status(200).json({
    success: true,
    data: {
      customer,
      orders
    }
  })
})

export const updateCustomerBlockStatus = asyncHandler(async (req, res) => {
  console.log('REQUEST BODY:', req.body)
  console.log('CONTENT TYPE:', req.headers['content-type'])
  console.log('IS_BLOCKED:', req.body?.is_blocked)
  console.log('TYPE:', typeof req.body?.is_blocked)

  const { userId } = req.params
  const { is_blocked } = req.body
  // Validate request body
  if (typeof is_blocked !== 'boolean') {
    throw new AppError(
      400,
      'is_blocked must be a boolean'
    )
  }

  // Find the customer
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('users')
    .select('user_id, name, email, role, is_blocked')
    .eq('user_id', userId)
    .maybeSingle()

  if (customerError) {
    throw new AppError(500, 'Failed to find customer')
  }

  if (!customer) {
    throw new AppError(404, 'Customer not found')
  }

  // Do not allow admin accounts to be blocked
  if (customer.role !== 'customer') {
    throw new AppError(
      403,
      'Only customer accounts can be blocked'
    )
  }

  // Update block status
  const { data: updatedCustomer, error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      is_blocked
    })
    .eq('user_id', userId)
    .select('user_id, name, email, is_blocked')
    .single()

  if (updateError) {
    throw new AppError(500, 'Failed to update customer status')
  }

  res.status(200).json({
    success: true,
    message: is_blocked
      ? 'Customer blocked successfully'
      : 'Customer unblocked successfully',
    data: updatedCustomer
  })
})