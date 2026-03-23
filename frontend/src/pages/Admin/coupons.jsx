import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabaseClient.js'
import '../../assets/css/Admin.css'

const Coupons = () => {
  const [form, setForm] = useState({
    code: '',
    discount: '',
    max_uses: '',
    expiry_date: '',
  })
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleReset = () => {
    setForm({ code: '', discount: '', max_uses: '', expiry_date: '' })
    setIsActive(true)
    setErrors({})
  }
  const validate = () => {
    const newErrors = {}

    if (!form.code.trim())        newErrors.code = 'Coupon code is required'
    if (!form.discount)           newErrors.discount = 'Discount percentage is required'
    else if (Number(form.discount) < 1 || Number(form.discount) > 100)
                                  newErrors.discount = 'Discount must be between 1 and 100'
    if (!form.max_uses)           newErrors.max_uses = 'Max uses is required'
    else if (Number(form.max_uses) < 1)
                                  newErrors.max_uses = 'Max uses must be at least 1'
    if (!form.expiry_date)        newErrors.expiry_date = 'Expiry date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    console.log('Inserting coupon:', {
  code: form.code.trim(),
  discount: Number(form.discount),
  max_uses: Number(form.max_uses),
  used_count: 0,
  expiry_date: form.expiry_date,
  is_active: isActive,
})
    if (!validate()) return
    console.log('Inserting coupon:', {
  code: form.code.trim(),
  discount: Number(form.discount),
  max_uses: Number(form.max_uses),
  used_count: 0,
  expiry_date: form.expiry_date,
  is_active: isActive,
})

    setLoading(true)

    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: form.code.trim(),
          discount: Number(form.discount),
          max_uses: Number(form.max_uses),
          used_count: 0,
          expiry_date: form.expiry_date,
          is_active: isActive,
        })

      if (error) {
        // Supabase unique constraint error code
        if (error.code === '23505') {
          setErrors({ code: 'This coupon code already exists' })
        } else {
          throw error
        }
        return
      }

      handleReset()
      await fetchCoupons()
      showToastMsg('Coupon created successfully')

    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const toggleCoupon = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setCoupons(prev =>
        prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c)
      )
      showToastMsg(currentStatus ? 'Coupon disabled' : 'Coupon enabled')

    } catch (err) {
      console.error(err)
      alert('Could not update coupon. Please try again.')
    }
  }

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCoupons(prev => prev.filter(c => c.id !== id))
      showToastMsg('Coupon deleted')

    } catch (err) {
      console.error(err)
      alert('Could not delete coupon. Please try again.')
    }
  }
  const showToastMsg = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3200)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoadingCoupons(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setCoupons(data)
    setLoadingCoupons(false)
  }

  return (
    <div className="coup-page">

      <div className="coup-page-header">
        <div>
          <h1 className="coup-page-title">Manage <em>Coupons</em></h1>
          <p className="coup-page-subtitle">Create and manage discount codes for your customers</p>
        </div>
      </div>

      <div className="coup-grid">

      {/* LEFT — Form */}
      <div>
        <div className="coup-card">

          <div className="coup-card-header">
            <div className="coup-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <div className="coup-card-heading">Create <em>Coupon</em></div>
              <div className="coup-card-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="coup-card-body">

            {/* Coupon Code */}
            <div className="coup-field">
              <label className="coup-label">
                Coupon Code <span className="coup-label-required">*</span>
              </label>
              <div className="coup-input-wrap">
                <span className="coup-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </span>
                <input
                  className="coup-input"
                  type="text"
                  name="code"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              {errors.code && <p className="coup-error">{errors.code}</p>}
            </div>

            {/* Discount & Max Uses */}
            <div className="coup-row">

              {/* Discount */}
              <div className="coup-field">
                <label className="coup-label">
                  Discount <span className="coup-label-required">*</span>
                </label>
                <div className="coup-input-wrap">
                  <span className="coup-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <line x1="19" y1="5" x2="5" y2="19"/>
                      <circle cx="6.5" cy="6.5" r="2.5"/>
                      <circle cx="17.5" cy="17.5" r="2.5"/>
                    </svg>
                  </span>
                  <input
                    className="coup-input"
                    type="number"
                    name="discount"
                    placeholder="0"
                    min="1"
                    max="100"
                    value={form.discount}
                    onChange={handleChange}
                  />
                  <span className="coup-input-suffix">%</span>
                </div>
                {errors.discount && <p className="coup-error">{errors.discount}</p>}
              </div>

              {/* Max Uses */}
              <div className="coup-field">
                <label className="coup-label">
                  Max Uses <span className="coup-label-required">*</span>
                </label>
                <div className="coup-input-wrap">
                  <span className="coup-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <input
                    className="coup-input"
                    type="number"
                    name="max_uses"
                    placeholder="0"
                    min="1"
                    value={form.max_uses}
                    onChange={handleChange}
                  />
                </div>
                {errors.max_uses && <p className="coup-error">{errors.max_uses}</p>}
              </div>

            </div>

            {/* Expiry Date */}
            <div className="coup-field">
              <label className="coup-label">
                Expiry Date <span className="coup-label-required">*</span>
              </label>
              <div className="coup-input-wrap">
                <span className="coup-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <input
                  className="coup-input"
                  type="date"
                  name="expiry_date"
                  value={form.expiry_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                />
              </div>
              {errors.expiry_date && <p className="coup-error">{errors.expiry_date}</p>}
            </div>
            {/* Active Toggle */}
            <div className="coup-status-row">
              <div className="coup-status-info">
                <span className="coup-status-label">Coupon Status</span>
                <span className="coup-status-desc">
                  {isActive ? 'Coupon is active and usable' : 'Coupon is disabled'}
                </span>
              </div>
              <label className="coup-toggle">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <span className="coup-toggle-track" />
                <span className="coup-toggle-thumb" />
              </label>
            </div>

            {/* Actions */}
            <div className="coup-actions">
              <button
                className="coup-btn-reset"
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
                className="coup-btn-primary"
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
                    Save Coupon
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT — Coupons list */}
      <div>
        <div className="coup-card coup-list-card">

          <div className="coup-card-header">
            <div className="coup-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div>
              <div className="coup-card-heading">Active <em>Coupons</em></div>
              <div className="coup-card-sub">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</div>
            </div>
          </div>

          {loadingCoupons ? (
            <div className="coup-list-loading">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="coup-list-empty">
              <div className="coup-list-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <p>No coupons created yet</p>
            </div>
          ) : (
            <ul className="coup-list">
              {coupons.map((coupon) => (
                <li key={coupon.id} className="coup-list-item">

                  <span className="coup-list-badge">{coupon.code}</span>

                  <div className="coup-list-info">
                    <div className="coup-list-discount">{coupon.discount}% off</div>
                    <div className="coup-list-meta">
                      Expires {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })} · Used <span>{coupon.used_count}</span> / {coupon.max_uses}
                    </div>
                  </div>

                  <div className="coup-list-actions">
                    <label className="coup-list-toggle">
                      <input
                        type="checkbox"
                        checked={coupon.is_active}
                        onChange={() => toggleCoupon(coupon.id, coupon.is_active)}
                      />
                      <span className="coup-list-toggle-track" />
                      <span className="coup-list-toggle-thumb" />
                    </label>

                    <button
                      className="coup-list-delete"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          )}

        </div>
      </div>

      </div>
      {/* Toast */}
      {showToast && (
        <div className="coup-toast">
          <div className="coup-toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="coup-toast-title">{toastMsg}</div>
            <div className="coup-toast-sub">Coupon list has been updated</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons