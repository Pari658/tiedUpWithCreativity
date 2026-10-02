import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getReviews = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      review_id,
      rating,
      comment,
      is_approved,
      created_at,
      product:product_id ( product_name ),
      reviewer:user_id ( name )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  res.json(data)
})

export const approveReview = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({ is_approved: true })
    .eq('review_id', req.params.id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new AppError(404, 'Review not found')
  res.json(data)
})

export const deleteReview = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('review_id', req.params.id)

  if (error) throw error
  res.status(204).send()
})
