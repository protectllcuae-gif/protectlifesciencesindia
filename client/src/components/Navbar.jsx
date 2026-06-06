import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { name: 'Home',    path: '/' },
  { name: 'Shop',    path: '/shop' },
  { name: 'About',   path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar({ cart, currentUser, userRole }) {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartOpen, setCartOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const cartRef    = useRef(null)
  const navigate   = useNavigate()
  const location   = useLocation()
  const itemCount  = cart ? cart.reduce((s, i) => s + i.quantity, 0) : 0

  /* ── scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── close cart on outside click ── */
  useEffect(() => {
    const onClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  /* ── close mobile menu on route change ── */
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <header className="navbar-wrapper" role="banner" aria-label="Site header">
      <div className="navbar-outer">

        {/* ── Floating pill container ── */}
        <div className={`navbar-pill ${scrolled ? 'navbar-pill--scrolled' : ''}`}>

          {/* ── Logo ── */}
          <Link to="/" className="navbar-pill__logo" aria-label="Protect Life Sciences home">
            <img 
              src="/images/protect-logo.png" 
              alt="Protect Life Sciences Logo" 
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="navbar-pill__nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`navbar-pill__link ${isActive ? 'navbar-pill__link--active' : ''}`}
                >
                  {link.name}
                </Link>
              )
            })}
            {currentUser && userRole === 'admin' && (
              <Link
                to="/admin"
                className={`navbar-pill__link ${location.pathname === '/admin' ? 'navbar-pill__link--active' : ''}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* ── Actions ── */}
          <div className="navbar-pill__actions">

            {/* Cart button */}
            <div className="navbar-pill__cart-wrap" ref={cartRef}>
              <button
                id="cartToggleBtn"
                className="navbar-pill__cart-btn"
                onClick={() => setCartOpen(!cartOpen)}
                aria-label={`Open cart (${itemCount} items)`}
                aria-expanded={cartOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {itemCount > 0 && (
                  <span className="navbar-pill__cart-badge" aria-label={`${itemCount} items`}>
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Cart dropdown */}
              <AnimatePresence>
                {cartOpen && (
                  <motion.div
                    className="navbar-pill__cart-dropdown"
                    id="cartDropdown"
                    role="dialog"
                    aria-label="Cart preview"
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="navbar-pill__cart-header">
                      <h3>Cart</h3>
                      <button className="navbar-pill__cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">&times;</button>
                    </div>
                    {!cart || cart.length === 0 ? (
                      <p className="navbar-pill__cart-empty">Your cart is empty.</p>
                    ) : (
                      <>
                        <ul className="navbar-pill__cart-items">
                          {cart.map((item) => (
                            <li key={item.slug} className="navbar-pill__cart-item">
                              <img src={item.image_url} alt={item.name} />
                              <div>
                                <p>{item.name}</p>
                                <span>₹{item.price} × {item.quantity}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="navbar-pill__cart-footer">
                          <strong>Total: ₹{cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</strong>
                          <Link to="/cart" className="btn btn-gold navbar-pill__cart-view" onClick={() => setCartOpen(false)}>
                            View Cart
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth CTA */}
            {currentUser ? (
              <button className="navbar-pill__cta" onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/login" className="navbar-pill__cta">Login</Link>
            )}

            {/* Hamburger */}
            <button
              id="navHamburger"
              className={`navbar-pill__hamburger ${menuOpen ? 'navbar-pill__hamburger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Mobile menu (animated) ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="navbar-mobile"
              id="mobileNavMenu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              aria-label="Mobile navigation"
            >
              <div className="navbar-mobile__inner">
                <nav className="navbar-mobile__links">
                  {NAV_LINKS.map((link) => {
                    const isActive = link.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(link.path)
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`navbar-mobile__link ${isActive ? 'navbar-mobile__link--active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                  {currentUser && userRole === 'admin' && (
                    <Link to="/admin" className="navbar-mobile__link" onClick={() => setMenuOpen(false)}>Admin</Link>
                  )}
                  {currentUser && (
                    <Link to="/dashboard" className="navbar-mobile__link" onClick={() => setMenuOpen(false)}>My Account</Link>
                  )}
                </nav>
                <div className="navbar-mobile__footer">
                  {currentUser ? (
                    <button className="navbar-mobile__cta" onClick={() => { handleLogout(); setMenuOpen(false) }}>Logout</button>
                  ) : (
                    <Link to="/login" className="navbar-mobile__cta" onClick={() => setMenuOpen(false)}>Login / Sign Up</Link>
                  )}
                  <p className="navbar-mobile__note">Protect Life Sciences · Sharjah, UAE</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  )
}