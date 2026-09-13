import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('category')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  res.json(data)
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if (!name) throw new AppError(400, 'Category name is required')

  const { data, error } = await supabaseAdmin
    .from('category')
    .insert([{ name: name.trim(), description: description?.trim() || '' }])
    .select()
    .single()

  if (error) throw error
  res.status(201).json(data)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('category')
    .delete()
    .eq('category_id', req.params.id)

  if (error) throw error
  res.status(204).send()
})
