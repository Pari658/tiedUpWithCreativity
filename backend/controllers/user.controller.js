import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getProfile = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('name, email, phone, role, is_blocked, avatar_url')
    .eq('user_id', req.user.id)
    .single()

  if (error || !data) throw new AppError(404, 'User not found')
  res.json(data)
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ name, phone })
    .eq('user_id', req.user.id)
    .select('name, email, phone, role, is_blocked, avatar_url')
    .single()

  if (error) throw error
  res.json(data)
})

export const getAddress = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('address')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (error) throw error
  res.json(data || {})
})

export const upsertAddress = asyncHandler(async (req, res) => {
  const { address_line1, address_line2, city, state, pincode, country } = req.body

  const { data, error } = await supabaseAdmin
    .from('address')
    .upsert(
      { 
        user_id: req.user.id, 
        address_line1, 
        address_line2, 
        city, 
        state, 
        pincode, 
        country 
      }, 
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  res.json(data)
})
