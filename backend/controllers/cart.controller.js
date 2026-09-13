import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getCart = asyncHandler(async (req, res) => {
  const { data: cart, error: cartError } = await supabaseAdmin
    .from('cart')
    .select('cart_id')
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (cartError) throw cartError
  if (!cart) return res.json([])

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:product_id (
        product_id,
        product_name,
        price,
        stock,
        product_images!product_images_product_id_fkey (
          image_url,
          is_primary
        )
      )
    `)
    .eq('cart_id', cart.cart_id)

  if (error) throw error
  res.json(data)
})

export const addItem = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body

  if (!product_id) throw new AppError(400, 'Product ID is required')

  let { data: cart, error: cartError } = await supabaseAdmin
    .from('cart')
    .select('cart_id')
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (cartError) throw cartError

  if (!cart) {
    const { data: newCart, error: newCartError } = await supabaseAdmin
      .from('cart')
      .insert([{ user_id: req.user.id }])
      .select('cart_id')
      .single()

    if (newCartError) throw newCartError
    cart = newCart
  }

  const { error: rpcError } = await supabaseAdmin.rpc('upsert_cart_item', {
    p_user_id: req.user.id,
    target_cart_id: cart.cart_id,
    target_product_id: product_id,
    quantity_delta: quantity
  })

  if (rpcError) throw rpcError

  res.status(201).json({
    success: true,
  })
})

export const updateItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body

  if (quantity === undefined) throw new AppError(400, 'Quantity is required')

  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('cart_id, cart!inner(user_id)')
    .eq('id', req.params.id)
    .single()

  if (itemError || !item) throw new AppError(404, 'Cart item not found')
  
  if (item.cart.user_id !== req.user.id) {
    throw new AppError(403, 'Not authorized to update this cart item')
  }

  const { data, error: updateError } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', req.params.id)
    .select()
    .single()

  if (updateError) throw updateError
  res.json(data)
})

export const removeItem = asyncHandler(async (req, res) => {
  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('cart_id, cart!inner(user_id)')
    .eq('id', req.params.id)
    .single()

  if (itemError || !item) throw new AppError(404, 'Cart item not found')
  
  if (item.cart.user_id !== req.user.id) {
    throw new AppError(403, 'Not authorized to delete this cart item')
  }

  const { error: deleteError } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', req.params.id)

  if (deleteError) throw deleteError
  res.status(204).send()
})
