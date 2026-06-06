import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917385060011'
  const cleanNumber = rawNumber.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanNumber}`

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner container">
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="Protect Life Sciences home">
            <div className="footer__logo-img-wrap">
              <img
                src="/images/protect-logo.png"
                alt="Protect Life Sciences Logo"
              />
            </div>
          </Link>
          <p className="footer__tagline">Born in Dubai. Trusted Globally. Now in India.</p>
          <p className="footer__detail">Protect Life Sciences FZE LLC<br />Sharjah, United Arab Emirates</p>
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer__col">
          <h4>Customer</h4>
          <Link to="/dashboard">My Account</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/login">Login / Sign Up</Link>
          <Link to="/login?tab=admin">Admin Login</Link>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          <p>📞 UAE: +971 567 464 623</p>
          <p>📞 India: +91 7385060011</p>
          <p>✉️ sales@protectgummies.com</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer__wa">
            WhatsApp
          </a>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Protect Life Sciences FZE LLC. All rights reserved.</p>
      </div>
    </footer>
  )
}