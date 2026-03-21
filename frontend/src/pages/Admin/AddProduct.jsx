import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient.js";
import '../../assets/css/Admin.css'

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    stock: '',
  })
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [images, setImages] = useState([])
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showToast, setShowToast] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('category')
        .select('category_id, name')

      if (!error) setCategories(data)
      setLoadingCats(false)
    }

    fetchCategories()
  }, [])

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    if (primaryIndex === index) setPrimaryIndex(0)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/')
    )
    setImages(prev => [...prev, ...files])
  }

  const handleReset = () => {
    setForm({
      name: '',
      description: '',
      category_id: '',
      price: '',
      stock: '',
    })
    setImages([])
    setPrimaryIndex(0)
    setIsActive(true)
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}

    if (!form.name.trim())            newErrors.name = 'Product name is required'
    if (!form.description.trim())     newErrors.description = 'Description is required'
    if (!form.category_id)            newErrors.category_id = 'Please select a category'
    if (!form.price)                  newErrors.price = 'Price is required'
    else if (Number(form.price) <= 0) newErrors.price = 'Price must be greater than 0'
    if (!form.stock)                  newErrors.stock = 'Stock quantity is required'
    else if (Number(form.stock) < 0)  newErrors.stock = 'Stock cannot be negative'
    if (images.length === 0)          newErrors.images = 'Please upload at least one image'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    console.log('Submitting:', {
      product_name: form.name.trim(),
      description: form.description.trim(),
      category_id: form.category_id,
      price: Number(form.price),
      stock: Number(form.stock),
      is_active: isActive,
    })
    try {
      // Step 1 — Insert product into database
      const { data: product, error: productError } = await supabase
        .from('product')
        .insert({
          product_name: form.name.trim(),
          description: form.description.trim(),
          category_id: form.category_id,
          price: Number(form.price),
          stock: Number(form.stock),
          is_active: isActive,
        })
        .select()
        .single()

      if (productError) throw productError

      // Step 2 — Upload each image to Supabase Storage
      const imageInserts = []

      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${product.product_id}_${i}_${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Step 3 — Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        imageInserts.push({
          product_id: product.product_id,
          image_url: urlData.publicUrl,
          is_primary: i === primaryIndex,
        })
      }

      // Step 4 — Insert all image records into product_images table
      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts)

      if (imagesError) throw imagesError

      // Step 5 — Success
      handleReset()
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3200)

    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prod-page">

      {/* Page Header */}
      <div className="prod-page-header">
        <div>
          <h1 className="prod-page-title">Add <em>Product</em></h1>
          <p className="prod-page-subtitle">Fill in the details to list a new bracelet</p>
        </div>
      </div>

      {/* Grid */}
      <div className="prod-grid">

        {/* LEFT — Form */}
        <div>
          <div className="prod-card">

            <div className="prod-card-header">
              <div className="prod-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <div className="prod-card-heading">Product <em>Details</em></div>
                <div className="prod-card-sub">Fill in all required fields</div>
              </div>
            </div>

            <div className="prod-card-body">

              {/* Product Name */}
              <div className="prod-field">
                <label className="prod-label">
                  Product Name <span className="prod-label-required">*</span>
                </label>
                <div className="prod-input-wrap">
                  <span className="prod-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </span>
                  <input
                    className="prod-input"
                    type="text"
                    name="name"
                    placeholder="e.g. Golden Thread Bracelet"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <p className="prod-error">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="prod-field">
                <label className="prod-label">
                  Description <span className="prod-label-required">*</span>
                </label>
                <div className="prod-textarea-wrap">
                  <span className="prod-textarea-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </span>
                  <textarea
                    className="prod-textarea"
                    name="description"
                    placeholder="Describe the bracelet — material feel, occasion, what makes it special..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                {errors.description && <p className="prod-error">{errors.description}</p>}
              </div>

              {/* Category */}
              <div className="prod-field">
                <label className="prod-label">
                  Category <span className="prod-label-required">*</span>
                </label>
                <div className="prod-input-wrap">
                  <span className="prod-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </span>
                  <select
                    className="prod-select"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      {loadingCats ? 'Loading categories...' : 'Select a category'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category_id && <p className="prod-error">{errors.category_id}</p>}
              </div>

              {/* Price & Stock */}
              <div className="prod-row">

                {/* Price */}
                <div className="prod-field">
                  <label className="prod-label">
                    Price <span className="prod-label-required">*</span>
                  </label>
                  <div className="prod-input-wrap">
                    <span className="prod-input-prefix">₹</span>
                    <input
                      className="prod-input"
                      type="number"
                      name="price"
                      placeholder="0.00"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.price && <p className="prod-error">{errors.price}</p>}
                </div>

                {/* Stock */}
                <div className="prod-field">
                  <label className="prod-label">
                    Stock Quantity <span className="prod-label-required">*</span>
                  </label>
                  <div className="prod-input-wrap">
                    <span className="prod-input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                    </span>
                    <input
                      className="prod-input"
                      type="number"
                      name="stock"
                      placeholder="0"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.stock && <p className="prod-error">{errors.stock}</p>}
                </div>

              </div>

              {/* Images */}
              <div className="prod-field">
                <label className="prod-label">
                  Product Images <span className="prod-label-required">*</span>
                </label>

                <div
                  className={`prod-upload-area ${dragging ? 'dragging' : ''}`}
                  onDragOver={handleDrag}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                  />
                  <div className="prod-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </div>
                  <div className="prod-upload-title">Drop images here or click to browse</div>
                  <div className="prod-upload-sub">PNG, JPG, WEBP supported</div>
                </div>

                {errors.images && <p className="prod-error">{errors.images}</p>}

                {/* Previews */}
                {images.length > 0 && (
                  <div className="prod-previews">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`prod-preview-item ${index === primaryIndex ? 'primary' : ''}`}
                        onClick={() => setPrimaryIndex(index)}
                      >
                        <img src={URL.createObjectURL(img)} alt={`preview-${index}`} />
                        <button
                          className="prod-preview-remove"
                          onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                        >✕</button>
                        {index === primaryIndex && (
                          <span className="prod-preview-primary-badge">Main</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <p className="prod-upload-hint">
                    Click an image to set it as <span>main photo</span>
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="prod-status-row">
                <div className="prod-status-info">
                  <span className="prod-status-label">Product Status</span>
                  <span className="prod-status-desc">
                    {isActive ? 'Visible to customers in the shop' : 'Hidden from the shop'}
                  </span>
                </div>
                <label className="prod-toggle">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                  <span className="prod-toggle-track" />
                  <span className="prod-toggle-thumb" />
                </label>
              </div>

              {/* Actions */}
              <div className="prod-actions">
                <button
                  className="prod-btn-reset"
                  onClick={handleReset}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Reset
                </button>

                <button
                  className="prod-btn-primary"
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Save Product
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div>
          <div className="prod-card prod-preview-card">

            <div className="prod-card-header">
              <div className="prod-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div>
                <div className="prod-card-heading">Live <em>Preview</em></div>
                <div className="prod-card-sub">Updates as you type</div>
              </div>
            </div>

            {/* Image preview */}
            {images.length > 0 ? (
              <img
                className="prod-preview-image"
                src={URL.createObjectURL(images[primaryIndex])}
                alt="preview"
              />
            ) : (
              <div className="prod-preview-image-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>No image uploaded yet</span>
              </div>
            )}

            <div className="prod-preview-body">

              <div className="prod-preview-category">
                {categories.find(c => c.category_id === form.category_id)?.name || 'No category selected'}
              </div>

              <div className={`prod-preview-name ${!form.name ? 'empty' : ''}`}>
                {form.name || 'Product name will appear here'}
              </div>

              <div className={`prod-preview-desc ${!form.description ? 'empty' : ''}`}>
                {form.description || 'Product description will appear here...'}
              </div>

              <div className="prod-preview-divider" />

              <div className="prod-preview-footer">

                <div className={`prod-preview-price ${!form.price ? 'empty' : ''}`}>
                  {form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : 'Price'}
                </div>

                <div className={`prod-preview-status ${isActive ? 'active' : 'inactive'}`}>
                  <span className="prod-preview-status-dot" />
                  {isActive ? 'Active' : 'Inactive'}
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {showToast && (
        <div className="prod-toast">
          <div className="prod-toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="prod-toast-title">Product saved!</div>
            <div className="prod-toast-sub">The bracelet has been listed successfully</div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AddProduct