import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, currentUser } = useOutletContext() || { cart: [] }

  /* ── Auth guard: must be logged in to view cart ── */
  if (!currentUser) {
    return (
      <section className="auth-guard-page">
        <div className="auth-guard-card">
          <div className="auth-guard-icon">🛒</div>
          <h1 className="auth-guard-title">Sign In to View Your Cart</h1>
          <p className="auth-guard-desc">
            Create a free account or sign in to add products, view your cart, and place orders.
          </p>
          <div className="auth-guard-actions">
            <Link to="/login" className="auth-guard-btn auth-guard-btn--primary">Sign In / Create Account</Link>
            <Link to="/shop" className="auth-guard-btn auth-guard-btn--ghost">← Keep Shopping</Link>
          </div>
        </div>
      </section>
    )
  }

  const total = cart ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0
  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  if (!cart || cart.length === 0) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h1>Your Cart is Empty</h1>
          <p style={{ marginTop: '12px', opacity: 0.7 }}>Add some products to get started.</p>
          <Link to="/shop" className="btn btn-gold" style={{ marginTop: '24px', display: 'inline-block' }}>
            Browse Products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="pg-checkout-page">
      <div className="pg-checkout-hero">
        <div className="container">
          <Link className="pg-back-link" to="/shop" style={{ display: 'inline-block', marginBottom: '16px', color: '#e8c872', textDecoration: 'none' }}>← Back to shop</Link>
          <p className="eyebrow">Review</p>
          <h1>Shopping Cart</h1>
          <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="section container pg-checkout-grid">
        <div className="pg-cart-list">
          {cart.map((item) => (
            <div key={item.slug} className="pg-cart-item">
              <div className="pg-cart-img">
                <img src={item.image_url} alt={item.name} />
              </div>
              <div className="pg-cart-info">
                <h3>{item.name}</h3>
                <p className="pg-cart-unit">₹{item.price?.toLocaleString()} per unit</p>
                <div className="pg-cart-qty">
                  <button
                    onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >+</button>
                </div>
              </div>
              <div className="pg-cart-subtotal">
                <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                <button
                  className="pg-cart-remove"
                  onClick={() => removeFromCart(item.slug)}
                  aria-label={`Remove ${item.name} from cart`}
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pg-order-summary">
          <h2>Order Summary</h2>
          <div className="pg-summary-row">
            <span>Subtotal</span>
            <strong>₹{total.toLocaleString()}</strong>
          </div>
          <div className="pg-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free 🎉' : `₹${shipping}`}</span>
          </div>
          {shipping > 0 && (
            <p className="pg-free-shipping-note">Add ₹{(999 - total).toLocaleString()} more for free shipping</p>
          )}
          <div className="pg-summary-row pg-summary-total">
            <span>Total</span>
            <strong>₹{grandTotal.toLocaleString()}</strong>
          </div>
          <Link to="/checkout" className="btn btn-gold" style={{ width: '100%', marginTop: '24px', display: 'block', textAlign: 'center', fontSize: '11px', letterSpacing: '2px' }}>
            Proceed to Checkout →
          </Link>
          <Link to="/shop" className="pg-continue-link">← Continue Shopping</Link>
        </div>
      </div>
    </section>
  )
}