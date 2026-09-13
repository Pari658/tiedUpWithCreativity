import path from 'path'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const getProducts = asyncHandler(async (req, res) => {
  const { category, include_inactive } = req.query
  
  let productQuery = supabaseAdmin.from('product').select('*')

  // Public requests must only see active products.
  // RLS's product_read_policy (is_active = true OR is_admin()) is bypassed
  // by the service-role key, so this filter must be applied explicitly.
  if (include_inactive !== 'true') {
    productQuery = productQuery.eq('is_active', true)
  }

  if (category && category !== 'all') {
    productQuery = productQuery.eq('category_id', category)
  }
  
  const { data: products, error: productError } = await productQuery
  if (productError) throw productError

  const { data: images, error: imagesError } = await supabaseAdmin.from('product_images').select('*')
  if (imagesError) throw imagesError

  const mergedProducts = products.map(p => ({
    ...p,
    product_images: images.filter(img => img.product_id === p.product_id)
  }))

  res.json(mergedProducts)
})

export const createProduct = asyncHandler(async (req, res) => {
  const { product_name, description, category_id, price, stock, is_active, primaryIndex } = req.body

  if (!product_name || !category_id || !price || !stock) {
    throw new AppError(400, 'Missing required fields')
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from('product')
    .insert([{ 
      product_name, 
      description, 
      category_id, 
      price: Number(price), 
      stock: Number(stock), 
      is_active: is_active === 'true' || is_active === true 
    }])
    .select()
    .single()

  if (productError) throw productError

  if (req.files && req.files.length > 0) {
    const imageRecords = []
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const ext = path.extname(file.originalname) || '.jpg'
      const filename = `${product.product_id}_${i}_${Date.now()}${ext}`
      const uploadPath = `products/${filename}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(uploadPath, file.buffer, {
          contentType: file.mimetype
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(uploadPath)

      imageRecords.push({
        product_id: product.product_id,
        image_url: publicUrl,
        is_primary: i === Number(primaryIndex || 0)
      })
    }

    if (imageRecords.length > 0) {
      const { error: imageInsertError } = await supabaseAdmin
        .from('product_images')
        .insert(imageRecords)
        
      if (imageInsertError) throw imageInsertError
      
      product.product_images = imageRecords
    }
  } else {
    product.product_images = []
  }

  res.status(201).json(product)
})
