import { useState, useEffect } from 'react'
import { fetchApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/cart.css'

const CartPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  
  const SHIPPING_COST = 60

  // ══════════════════════════════════════════════════════════════
  // FETCH REAL DATA
  // ══════════════════════════════════════════════════════════════
  const fetchCart = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchApi('/api/cart')
      const items = data || []
      setCartItems(items)
      // Clear coupon when cart becomes empty
      if (items.length === 0) {
        setAppliedCoupon(null)
      }
    } catch (err) {
      console.error(err)
      setCartItems([])
      setAppliedCoupon(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // ══════════════════════════════════════════════════════════════
  // CALCULATIONS — derived every render, never stored in state
  // ══════════════════════════════════════════════════════════════
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price * item.quantity || 0)
  }, 0)

  // Discount is only meaningful when cart has items AND a coupon is applied
  const discountAmount = (cartItems.length > 0 && appliedCoupon)
    ? Math.round(subtotal * (appliedCoupon.discount / 100))
    : 0

  const total = subtotal - discountAmount + (cartItems.length > 0 ? SHIPPING_COST : 0)

  // ══════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════
  const showToastMsg = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3200)
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item)
    )
    try {
      await fetchApi(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQuantity }),
      })
    } catch (err) {
      console.error('Error updating quantity:', err)
    }
  }

  const removeItem = async (itemId) => {
    const remaining = cartItems.filter(item => item.id !== itemId)
    setCartItems(remaining)
    // Clear coupon when cart becomes empty
    if (remaining.length === 0) {
      setAppliedCoupon(null)
    }
    try {
      await fetchApi(`/api/cart/items/${itemId}`, { method: 'DELETE' })
      showToastMsg('Item removed from cart')
    } catch (err) {
      console.error('Error removing item:', err)
      fetchCart()
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    setCouponLoading(true)
    setCouponError('')
    try {
      const data = await fetchApi('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      })
      setAppliedCoupon(data)
      setCouponCode('')
      showToastMsg(`Coupon applied — ${data.discount}% off!`)
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    showToastMsg('Coupon removed')
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <div>
          <h1 className="cart-page-title">Your <em>Cart</em></h1>
          <p className="cart-page-subtitle">Review your items before placing your order</p>
        </div>
        {!loading && (
          <div className="cart-count-badge">
            <span className="cart-count-dot" />
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      <div className="cart-grid">
        <div className="cart-card">
          <div className="cart-card-header">
            <div className="cart-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <div className="cart-card-heading">Cart <em>Items</em></div>
              <div className="cart-card-sub">
                {loading ? 'Loading...' : `${cartItems.length} items in your cart`}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="cart-loading">Loading your cart...</div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div className="cart-empty-title">Your cart is <em>empty</em></div>
              <p className="cart-empty-desc">Explore our collection to add items!</p>
              <button onClick={() => navigate('/dashboard')} className="cart-empty-btn">Browse Shop</button>
            </div>
          ) : (
            <div>
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                
                const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];

                return (
                  <div key={item.id} className="cart-item">
                    {primaryImage ? (
                      <img className="cart-item-image" src={primaryImage.image_url} alt={product.product_name} />
                    ) : (
                      <div className="cart-item-image-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}

                    <div className="cart-item-info">
                      <div className="cart-item-name">{product.product_name}</div>
                      <div className="cart-item-price">₹{(product.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>

                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= product.stock}>+</button>
                    </div>

                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="cart-card cart-summary-card">
            <div className="cart-card-header">
              <div className="cart-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="cart-card-heading">Order <em>Summary</em></div>
              </div>
            </div>

            <div className="cart-summary-body">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {/* Only render discount line when coupon is applied AND cart has items */}
              {appliedCoupon && cartItems.length > 0 && (
                <div className="cart-summary-row">
                  <span>
                    Discount ({appliedCoupon.code} — {appliedCoupon.discount}%)
                    <button
                      onClick={removeCoupon}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#f08070', fontWeight: 600, marginLeft: '8px', fontSize: '0.85em'
                      }}
                      title="Remove coupon"
                    >✕</button>
                  </span>
                  <span className="discount">− ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{cartItems.length > 0 ? `₹${SHIPPING_COST}` : '—'}</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-total-row">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              {/* Coupon input — only show when no coupon is applied */}
              {!appliedCoupon && (
                <div className="cart-coupon-wrap">
                  <div className="cart-coupon-row">
                    <input className="cart-coupon-input" type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                    <button className="cart-coupon-btn" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="cart-coupon-error">{couponError}</p>}
                </div>
              )}

              {/* TODO: backend route not yet built (POST /api/checkout backed by process_checkout_atomic) */}
              <button className="cart-checkout-btn" disabled={cartItems.length === 0} onClick={() => alert('Checkout endpoint (POST /api/checkout) not yet built on backend!')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage