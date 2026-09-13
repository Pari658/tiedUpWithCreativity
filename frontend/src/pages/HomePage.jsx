import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../assets/css/home.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi('/api/categories')
        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const query = activeCategory !== 'all' ? `?category=${activeCategory}` : ''
        const data = await fetchApi(`/api/products${query}`)
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeCategory])

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login')
      return
    }
    setAddingId(product.product_id)
    try {
      await fetchApi('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.product_id }),
      })
      setAddedId(product.product_id)
      setTimeout(() => setAddedId(null), 2000)
    } catch (err) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        alert('Error adding to cart: ' + err.message)
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="hp-page">
      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">✨ Handcrafted with Love</div>
          <h1 className="hp-hero-title">
            TIED UP <span className="hp-hero-accent">with</span> CREATIVITY
          </h1>
          <p className="hp-hero-tagline">
            Discover handcrafted bracelets &amp; anklets that tell your story. 
            Every piece is made to make you smile.
          </p>
          <div className="hp-hero-actions">
            <button className="hp-hero-btn primary" onClick={() => {
              document.getElementById('hp-products')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Shop Collection
            </button>
            {!user && (
              <button className="hp-hero-btn secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            )}
            {user && (
              <button className="hp-hero-btn secondary" onClick={() => navigate('/dashboard')}>
                My Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="hp-categories" id="hp-products">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Browse by <em>Category</em></h2>
          <p className="hp-section-sub">Find the perfect piece for every occasion</p>
        </div>
        <div className="hp-cat-row">
          <button
            className={`hp-cat-chip${activeCategory === 'all' ? ' active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.category_id}
              className={`hp-cat-chip${activeCategory === cat.category_id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.category_id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Products ── */}
      <section className="hp-products">
        {loading ? (
          <div className="hp-loading">
            <div className="hp-spinner" />
            <p>Loading collection...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="hp-empty">
            <div className="hp-empty-icon">💍</div>
            <h3>No products found</h3>
            <p>Check back soon — new designs are always being added!</p>
          </div>
        ) : (
          <div className="hp-product-grid">
            {products.map(product => {
              const img = product.product_images?.find(i => i.is_primary) || product.product_images?.[0]
              const isAdding = addingId === product.product_id
              const isAdded = addedId === product.product_id

              return (
                <div key={product.product_id} className="hp-card">
                  <div className="hp-card-img-wrap">
                    {!product.stock && (
                      <div className="hp-oos-badge">Out of Stock</div>
                    )}
                    {img ? (
                      <img src={img.image_url} alt={product.product_name} className="hp-card-img" />
                    ) : (
                      <div className="hp-card-img-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="hp-card-body">
                    <h3 className="hp-card-name">{product.product_name}</h3>
                    {product.description && (
                      <p className="hp-card-desc">{product.description}</p>
                    )}
                    <div className="hp-card-footer">
                      <span className="hp-card-price">₹{product.price}</span>
                      <button
                        className={`hp-card-atc${isAdded ? ' added' : ''}`}
                        disabled={!product.stock || isAdding}
                        onClick={() => handleAddToCart(product)}
                      >
                        {isAdded ? '✓ Added' : isAdding ? '...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <p>© 2026 Tied Up with Creativity. Made to make you smile.</p>
      </footer>
    </div>
  )
}