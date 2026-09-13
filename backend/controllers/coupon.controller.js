import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getCoupons = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  res.json(data)
})

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discount, max_uses, expiry_date, is_active } = req.body

  if (!code || !discount || !max_uses || !expiry_date) {
    throw new AppError(400, 'Missing required fields')
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert([{ 
      code: code.trim(), 
      discount: Number(discount), 
      max_uses: Number(max_uses), 
      used_count: 0, 
      expiry_date, 
      is_active 
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'This coupon code already exists', 'code')
    }
    throw error
  }

  res.status(201).json(data)
})

export const toggleCoupon = asyncHandler(async (req, res) => {
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('coupons')
    .select('is_active')
    .eq('id', req.params.id)
    .single()

  if (fetchError || !current) throw new AppError(404, 'Coupon not found')

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .update({ is_active: !current.is_active })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) throw error
  res.json(data)
})

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('coupons')
    .delete()
    .eq('id', req.params.id)

  if (error) throw error
  res.status(204).send()
})

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body

  if (!code) throw new AppError(400, 'Coupon code is required')

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) throw new AppError(404, 'Invalid or expired coupon code')

  if (new Date(coupon.expiry_date) < new Date()) {
    throw new AppError(400, 'Coupon has expired')
  }

  if (coupon.used_count >= coupon.max_uses) {
    throw new AppError(400, 'Coupon usage limit reached')
  }

  res.json(coupon)
})
