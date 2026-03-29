import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabaseClient.js'
import { useAuth } from '../../context/AuthContext'
import '../../assets/css/cart.css'

const CartPage = () => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  
  const SHIPPING_COST = 60
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)

  const discountAmount = appliedCoupon
    ? Math.round(subtotal * (appliedCoupon.discount / 100))
    : 0

  const total = subtotal - discountAmount + (cartItems.length > 0 ? SHIPPING_COST : 0)
  const mockCartItems = [
    {
      id: '1',
      quantity: 2,
      product: {
        product_id: 'p1',
        product_name: 'Golden Thread Bracelet',
        price: 499,
        stock: 10,
        product_images: [{ image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200', is_primary: true }]
      }
    },
    {
      id: '2',
      quantity: 1,
      product: {
        product_id: 'p2',
        product_name: 'Rose Charm Bracelet',
        price: 349,
        stock: 5,
        product_images: [{ image_url: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=200', is_primary: true }]
      }
    },
    {
      id: '3',
      quantity: 1,
      product: {
        product_id: 'p3',
        product_name: 'Mint Pearl Bracelet',
        price: 699,
        stock: 3,
        product_images: [{ image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=200', is_primary: true }]
      }
    }
  ]

  const showToastMsg = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3200)
  }

  useEffect(() => {
    // if (user) fetchCart() — uncomment when shop page is ready
    setCartItems(mockCartItems)
    setLoading(false)
  }, [user])

  const fetchCart = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('cart')
      .select(`
        cart_id,
        cart_items (
          id,
          quantity,
          product (
            product_id,
            product_name,
            price,
            stock,
            product_images (
              image_url,
              is_primary
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    setCartItems(data?.cart_items || [])
    setLoading(false)
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)
  }

  const removeItem = async (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))

    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    showToastMsg('Item removed from cart')
  }
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data) {
      setCouponError('Invalid or expired coupon code')
      setCouponLoading(false)
      return
    }

    // Check if expired
    if (new Date(data.expiry_date) < new Date()) {
      setCouponError('This coupon has expired')
      setCouponLoading(false)
      return
    }

    // Check if max uses reached
    if (data.used_count >= data.max_uses) {
      setCouponError('This coupon has reached its usage limit')
      setCouponLoading(false)
      return
    }

    setAppliedCoupon(data)
    setCouponCode('')
    setCouponLoading(false)
    showToastMsg(`Coupon applied — ${data.discount}% off!`)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    showToastMsg('Coupon removed')
  }
  return (
    <div className="cart-page">

      {/* Page Header */}
      <div className="cart-page-header">
        <div>
          <h1 className="cart-page-title">Your <em>Cart</em></h1>
          <p className="cart-page-subtitle">
            Review your items before placing your order
          </p>
        </div>
        {!loading && (
          <div className="cart-count-badge">
            <span className="cart-count-dot" />
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="cart-grid">

        {/* LEFT — Cart items */}
        <div>
          <div className="cart-card">

            <div className="cart-card-header">
              <div className="cart-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div>
                <div className="cart-card-heading">Cart <em>Items</em></div>
                <div className="cart-card-sub">
                  {loading ? 'Loading...' : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`}
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="cart-loading">Loading your cart...</div>
            )}

            {/* Empty state */}
            {!loading && cartItems.length === 0 && (
              <div className="cart-empty">
                <div className="cart-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div className="cart-empty-title">Your cart is <em>empty</em></div>
                <p className="cart-empty-desc">
                  Looks like you haven't added any bracelets yet.
                  <br />Go explore our collection!
                </p>
                <a href="/shop" className="cart-empty-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Browse Shop
                </a>
              </div>
            )}

            {/* Cart items list */}
            {!loading && cartItems.length > 0 && (
              <div>
                {cartItems.map((item) => {
                  const product = item.product
                  const primaryImage = product.product_images?.find(img => img.is_primary)

                  return (
                    <div key={item.id} className="cart-item">

                      {primaryImage ? (
                        <img
                          className="cart-item-image"
                          src={primaryImage.image_url}
                          alt={product.product_name}
                        />
                      ) : (
                        <div className="cart-item-image-empty">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}

                      <div className="cart-item-info">
                        <div className="cart-item-name">{product.product_name}</div>
                        <div className="cart-item-price">
                          ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        {item.quantity > product.stock && (
                          <div className="cart-item-stock-warn">
                            Only {product.stock} left in stock
                          </div>
                        )}
                      </div>

                      <div className="cart-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >−</button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                        >+</button>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeItem(item.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT — Order summary */}
        <div>
          <div className="cart-card cart-summary-card">

            <div className="cart-card-header">
              <div className="cart-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="cart-card-heading">Order <em>Summary</em></div>
                <div className="cart-card-sub">Price breakdown</div>
              </div>
            </div>

            <div className="cart-summary-body">

              {/* Subtotal */}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Discount */}
              {appliedCoupon && (
                <div className="cart-summary-row">
                  <span className="cart-summary-label">
                    Discount ({appliedCoupon.discount}% off)
                  </span>
                  <span className="cart-summary-value discount">
                    − ₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Shipping */}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Shipping</span>
                <span className="cart-summary-value">
                  {cartItems.length > 0
                    ? `₹${SHIPPING_COST.toLocaleString('en-IN')}`
                    : '—'
                  }
                </span>
              </div>

              <div className="cart-summary-divider" />

              {/* Total */}
              <div className="cart-summary-total-row">
                <span className="cart-summary-total-label">Total</span>
                <span className="cart-summary-total-value">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Coupon input */}
              <div className="cart-coupon-wrap">
                <span className="cart-coupon-label">Have a coupon?</span>

                {appliedCoupon ? (
                  <div className="cart-coupon-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {appliedCoupon.code} — {appliedCoupon.discount}% off
                    <button className="cart-coupon-remove" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-coupon-row">
                      <input
                        className="cart-coupon-input"
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={couponLoading}
                      />
                      <button
                        className="cart-coupon-btn"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="cart-coupon-error">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Checkout button */}
              <button
                className="cart-checkout-btn"
                disabled={cartItems.length === 0}
                onClick={() => alert('Checkout coming soon!')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Proceed to Checkout
              </button>

            </div>
          </div>
        </div>

      </div>
        {/* Toast */}
        {showToast && (
          <div className="cart-toast">
            <div className="cart-toast-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div className="cart-toast-title">{toastMsg}</div>
              <div className="cart-toast-sub">Your cart has been updated</div>
            </div>
          </div>
        )}
    </div>
  )
}

export default CartPage