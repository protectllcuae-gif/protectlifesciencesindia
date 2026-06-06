import React, { useState } from 'react'
import { Link, useOutletContext, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function Checkout() {
  const { cart, clearCart, currentUser } = useOutletContext() || { cart: [] }

  /* ── Auth guard ── */
  if (!currentUser) {
    return (
      <section className="auth-guard-page">
        <div className="auth-guard-card">
          <div className="auth-guard-icon">🔐</div>
          <h1 className="auth-guard-title">Sign In to Checkout</h1>
          <p className="auth-guard-desc">
            You need to be signed in to complete your purchase. It only takes 30 seconds to create a free account!
          </p>
          <div className="auth-guard-actions">
            <Link to="/login" className="auth-guard-btn auth-guard-btn--primary">Sign In / Create Account</Link>
            <Link to="/cart" className="auth-guard-btn auth-guard-btn--ghost">← Back to Cart</Link>
          </div>
        </div>
      </section>
    )
  }
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Maharashtra'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState('')
  const [error, setError] = useState('')

  const total = cart ? cart.reduce((s, i) => s + i.price * i.quantity, 0) : 0
  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917385060011'
      const cleanNumber = rawNumber.replace(/\D/g, '')

      const orderMessage = `*New Order Placed!*\n\n*Customer Details:*\n- *Name:* ${form.name}\n- *Phone:* ${form.phone}\n- *Email:* ${form.email}\n- *Address:* ${form.address}, ${form.city}, ${form.state} - ${form.pincode}\n\n*Order Items:*\n${cart.map((item) => `• ${item.name} × ${item.quantity} (₹${item.price.toLocaleString()})`).join('\n')}\n\n*Subtotal:* ₹${total.toLocaleString()}\n*Shipping:* ${shipping === 0 ? 'Free' : `₹${shipping}`}\n*Total Amount:* *₹${grandTotal.toLocaleString()}*\n\nPlease confirm my order. Thank you!`
      const encodedText = encodeURIComponent(orderMessage)
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`
      setWhatsappLink(whatsappUrl)

      await addDoc(collection(db, 'orders'), {
        ...form,
        items: cart,
        total: grandTotal,
        status: 'pending',
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp()
      })

      if (clearCart) clearCart()
      setSubmitted(true)

      // Redirect user to WhatsApp
      window.location.href = whatsappUrl
    } catch (err) {
      console.error(err)
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.length === 0) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <h1>Checkout</h1>
          <p style={{ marginTop: '12px' }}>Your cart is empty.</p>
          <Link to="/shop" className="button button-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Browse Products</Link>
        </div>
      </section>
    )
  }

  if (submitted) {
    return (
      <section className="pg-checkout-page">
        <div className="pg-success-box" style={{ margin: '0 auto' }}>
          <div className="pg-success-icon">✓</div>
          <h1>Order Placed!</h1>
          <p>Thank you, {form.name}! We've recorded your order in our database. Click below if you were not automatically redirected to WhatsApp to confirm your order.</p>
          {whatsappLink && (
            <a href={whatsappLink} className="btn btn-gold" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: '16px', marginBottom: '24px' }}>
              💬 Complete Order on WhatsApp
            </a>
          )}
          <br />
          <Link to="/shop" className="btn btn-ghost" style={{ display: 'inline-flex', textDecoration: 'none' }}>Continue Shopping</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="pg-checkout-page">
      <div className="pg-checkout-hero">
        <div className="container">
          <Link className="pg-back-link" to="/cart" style={{ display: 'inline-block', marginBottom: '16px', color: '#e8c872', textDecoration: 'none' }}>← Back to cart</Link>
          <p className="eyebrow">Secure Checkout</p>
          <h1>Complete Your Order</h1>
        </div>
      </div>
      <div className="section container pg-checkout-grid">
        <form className="pg-checkout-form" onSubmit={handleSubmit}>
          <h2>Delivery Details</h2>
          {error && <div className="form-error">{error}</div>}
          <div className="pg-form-grid-2">
            <label>Full Name<input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" /></label>
            <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" /></label>
          </div>
          <div className="pg-form-grid-2">
            <label>Phone<input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXXXXXXX" /></label>
            <label>Pincode<input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="400001" /></label>
          </div>
          <label>Street Address<input name="address" value={form.address} onChange={handleChange} required placeholder="Flat/House No, Street, Area" /></label>
          <div className="pg-form-grid-2">
            <label>City<input name="city" value={form.city} onChange={handleChange} required placeholder="Mumbai" /></label>
            <label>State
              <select name="state" value={form.state} onChange={handleChange}>
                {['Maharashtra','Delhi','Karnataka','Tamil Nadu','Telangana','Gujarat','Rajasthan','Uttar Pradesh','West Bengal','Kerala'].map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Placing Order...' : 'Place Order'}</button>
        </form>

        <div className="pg-order-summary">
          <h2>Order Summary</h2>
          {cart.map((item) => (
            <div key={item.slug} className="pg-summary-row">
              <span>{item.name} &times; {item.quantity}</span>
              <strong>&#8377;{(item.price * item.quantity).toLocaleString()}</strong>
            </div>
          ))}
          <hr style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
          <div className="pg-summary-row"><span>Subtotal</span><strong>&#8377;{total.toLocaleString()}</strong></div>
          <div className="pg-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : '₹99'}</span></div>
          <div className="pg-summary-row pg-summary-total">
            <span>Total</span>
            <strong>&#8377;{grandTotal.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}