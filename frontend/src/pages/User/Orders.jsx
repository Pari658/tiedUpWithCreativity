import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchApi } from '../../lib/api'
import '../../assets/css/cart.css'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: backend route not yet built (GET /api/orders)
      const data = await fetchApi('/api/orders')
      setOrders(data || [])
    } catch (err) {
      console.log('Orders fetch note:', err.message)
      // Set error message indicating the endpoint is pending
      setError('Order history endpoint (GET /api/orders) is coming soon!')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  return (
    <div className="cart-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="cart-page-header">
        <div>
          <h1 className="cart-page-title">Your <em>Orders</em></h1>
          <p className="cart-page-subtitle">Track and view your past orders</p>
        </div>
      </div>

      <div className="cart-card" style={{ padding: '32px', textAlign: 'center' }}>
        {loading ? (
          <div className="cart-loading">Loading order history...</div>
        ) : error ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">📦</div>
            <div className="cart-empty-title">Orders <em>Coming Soon</em></div>
            <p className="cart-empty-desc">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">📦</div>
            <div className="cart-empty-title">No orders <em>placed yet</em></div>
            <p className="cart-empty-desc">Your past orders will appear here once placed.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-item-card" style={{ borderBottom: '1px solid #eee', padding: '16px 0', textAlign: 'left' }}>
                <h3>Order #{order.order_id}</h3>
                <p>Status: {order.order_status}</p>
                <p>Total: ₹{order.final_amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
