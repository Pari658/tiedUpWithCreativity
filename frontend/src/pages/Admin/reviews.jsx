import { useState, useEffect } from 'react'
import { fetchApi } from '../../lib/api'
import '../../assets/css/Admin.css'

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const StarFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
  </svg>
)

const StarEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

// ── Format date as "12 Mar 2025" ──────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Stars component ───────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="rev-stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={`rev-star${n <= rating ? ' filled' : ''}`}>
        {n <= rating ? <StarFilled /> : <StarEmpty />}
      </span>
    ))}
  </div>
)

// ── Reviews Page ──────────────────────────────────────────────────────────────
const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const data = await fetchApi('/api/reviews')
      setReviews(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showToastMsg = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3200)
  }

  const handleApprove = async (reviewId) => {
    // Optimistic update
    setReviews(prev =>
      prev.map(r => r.review_id === reviewId ? { ...r, is_approved: true } : r)
    )
    showToastMsg('Review approved')
    try {
      await fetchApi(`/api/reviews/${reviewId}/approve`, { method: 'PATCH' })
    } catch (err) {
      // Revert on failure
      setReviews(prev =>
        prev.map(r => r.review_id === reviewId ? { ...r, is_approved: false } : r)
      )
      alert('Could not approve review. Please try again.')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    // Optimistic update
    const backup = reviews
    setReviews(prev => prev.filter(r => r.review_id !== reviewId))
    showToastMsg('Review deleted')
    try {
      await fetchApi(`/api/reviews/${reviewId}`, { method: 'DELETE' })
    } catch (err) {
      // Revert on failure
      setReviews(backup)
      alert('Could not delete review. Please try again.')
    }
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const totalCount = reviews.length
  const pendingCount = reviews.filter(r => !r.is_approved).length
  const approvedCount = reviews.filter(r => r.is_approved).length

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'pending') return !r.is_approved
    if (activeFilter === 'approved') return r.is_approved
    return true
  })

  const filters = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
  ]

  return (
    <div className="rev-page">

      {/* ── Page Header ── */}
      <div className="rev-page-header">
        <div>
          <h1 className="rev-page-title">Manage <em>Reviews</em></h1>
          <p className="rev-page-subtitle">Moderate customer feedback and ratings</p>
        </div>
      </div>

      {/* ── Stat Badges ── */}
      <div className="rev-stats">
        <div className="rev-stat-badge">
          <span className="rev-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div className="rev-stat-info">
            <span className="rev-stat-value">{totalCount}</span>
            <span className="rev-stat-label">Total Reviews</span>
          </div>
        </div>

        <div className="rev-stat-badge rev-stat-pending">
          <span className="rev-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div className="rev-stat-info">
            <span className="rev-stat-value">{pendingCount}</span>
            <span className="rev-stat-label">Pending Approval</span>
          </div>
        </div>

        <div className="rev-stat-badge rev-stat-approved">
          <span className="rev-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </span>
          <div className="rev-stat-info">
            <span className="rev-stat-value">{approvedCount}</span>
            <span className="rev-stat-label">Approved</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="rev-filter-tabs">
        {filters.map(f => (
          <button
            key={f.key}
            className={`rev-filter-tab${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
            <span className="rev-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* ── Reviews List ── */}
      {loading ? (
        <div className="rev-loading">Loading reviews…</div>
      ) : filteredReviews.length === 0 ? (
        <div className="rev-empty">
          <div className="rev-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          </div>
          <p className="rev-empty-text"><em>No reviews here</em></p>
        </div>
      ) : (
        <div className="rev-list">
          {filteredReviews.map((review) => (
            <div key={review.review_id} className="rev-card">

              {/* Card top row: product + date */}
              <div className="rev-card-top">
                <div className="rev-card-meta">
                  <span className="rev-product-name">
                    {review.product?.product_name || 'Unknown Product'}
                  </span>
                  <span className="rev-dot">·</span>
                  <span className="rev-customer-name">
                    {review.reviewer?.name || 'Unknown Customer'}
                  </span>
                </div>
                <span className="rev-date">{formatDate(review.created_at)}</span>
              </div>

              {/* Stars */}
              <Stars rating={review.rating} />

              {/* Comment */}
              <p className="rev-comment">{review.comment}</p>

              {/* Status + Actions */}
              <div className="rev-card-bottom">
                <span className={`rev-status-pill${review.is_approved ? ' approved' : ' pending'}`}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </span>

                <div className="rev-card-actions">
                  {!review.is_approved && (
                    <button
                      className="rev-btn-approve"
                      onClick={() => handleApprove(review.review_id)}
                      title="Approve review"
                    >
                      <CheckIcon />
                      Approve
                    </button>
                  )}
                  <button
                    className="rev-btn-delete"
                    onClick={() => handleDelete(review.review_id)}
                    title="Delete review"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showToast && (
        <div className="rev-toast">
          <div className="rev-toast-icon">
            <CheckIcon />
          </div>
          <div>
            <div className="rev-toast-title">{toastMsg}</div>
            <div className="rev-toast-sub">Reviews list has been updated</div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Reviews