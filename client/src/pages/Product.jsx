import React, { useEffect, useState } from 'react'
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { Check, ShoppingCart, CreditCard, Star, ShieldCheck, Truck, Award } from 'lucide-react'
import SEO from '../components/SEO'

/* ── Login-wall modal ── */
function LoginWall({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="login-wall-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Login required"
      >
        <motion.div
          className="login-wall-card"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="login-wall-icon">🔒</div>
          <h2 className="login-wall-title">Login Required</h2>
          <p className="login-wall-desc">
            Please sign in or create a free account to add products to your cart and place orders.
          </p>
          <div className="login-wall-actions">
            <Link to="/login" className="login-wall-btn login-wall-btn--primary">
              Sign In / Create Account
            </Link>
            <button className="login-wall-btn login-wall-btn--ghost" onClick={onClose}>
              Continue Browsing
            </button>
          </div>
          <p className="login-wall-note">
            🛡 Your data is safe · WHO-GMP certified products
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Product() {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const [product, setProduct]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showLoginWall, setShowLoginWall] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])

  const outletCtx   = useOutletContext()
  const addToCart   = outletCtx?.addToCart
  const currentUser = outletCtx?.currentUser   // ← the logged-in user

  const { products: contextProducts } = useProducts()

  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      const found = contextProducts.find((p) => p.slug === slug)
      setProduct(found || null)
      if (found) {
        setActiveImage(found.image_url || (found.image_urls && found.image_urls[0]) || '')
        
        // Find other products for "You May Also Like"
        const filtered = contextProducts.filter((p) => p.slug !== slug)
        // Prioritize products in the same category
        const sorted = [...filtered].sort((a, b) => {
          if (a.category === found.category && b.category !== found.category) return -1
          if (a.category !== found.category && b.category === found.category) return 1
          return 0
        })
        setRelatedProducts(sorted.slice(0, 4))
      }
      setLoading(false)
    }
  }, [slug, contextProducts])

  if (loading) return <div className="message" style={{ padding: '80px 0', textAlign: 'center' }}>Loading product...</div>
  if (!product) return (
    <div className="message" style={{ padding: '80px 0', textAlign: 'center' }}>
      <p>Product not found.</p>
      <Link to="/shop" className="btn btn-gold" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Shop</Link>
    </div>
  )

  const benefits = product.benefits
    ? product.benefits.split('|').map((item) => item.trim()).filter(Boolean)
    : []

  const parseProductName = (fullName) => {
    if (!fullName) return { title: '', subtitle: '' }
    const parts = fullName.split(' - ')
    if (parts.length > 1) {
      return {
        title: parts[0],
        subtitle: parts[1]
      }
    }
    return {
      title: fullName,
      subtitle: ''
    }
  }

  const { title, subtitle } = parseProductName(product.name)
  const cleanSubtitle = subtitle ? subtitle.replace(', ', ' · ') : ''
  const originalPrice = Math.round((product.price / 0.8) / 10) * 10

  /* ── Guard: must be logged in to buy ── */
  const requireLogin = () => {
    if (!currentUser) {
      setShowLoginWall(true)
      return true   // blocked
    }
    return false    // allowed
  }

  const handleAddToCart = () => {
    if (requireLogin()) return
    if (addToCart) addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    if (requireLogin()) return
    if (addToCart) addToCart(product)
    navigate('/cart')
  }

  return (
    <>
      <SEO 
        title={product.name}
        description={product.short_description || product.full_description?.slice(0, 150)}
        keywords={`${product.name}, ${product.category || 'Gummies'}, health supplement, buy online, protect life sciences`}
      />
      {showLoginWall && <LoginWall onClose={() => setShowLoginWall(false)} />}

      <article className="product-detail">
        <div className="product-detail-meta container">
          <Link className="pg-back-link" to="/shop">← BACK TO SHOP</Link>
          {product.category && <span className="product-category">{product.category}</span>}
        </div>

        <div className="container product-detail-grid">
          <div className="product-detail-image">
            <div className="main-image-wrapper">
              <img src={activeImage} alt={product.name} />
            </div>
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="product-image-thumbnails">
                {product.image_urls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`product-thumbnail-btn ${activeImage === url ? 'active' : ''}`}
                    onClick={() => setActiveImage(url)}
                  >
                    <img src={url} alt={`${product.name} thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-detail-info">
            <div className="pdp-rating-line">
              <div className="pdp-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#c9a84c" stroke="#c9a84c" />
                ))}
              </div>
              <span className="pdp-rating-val">4.9/5</span>
              <span className="pdp-rating-count">Loved by 5,000+ customers</span>
            </div>

            <h1 className="pdp-main-title">{title}</h1>
            {cleanSubtitle && <div className="pdp-subtitle-badge">{cleanSubtitle}</div>}

            <div className="pdp-price-container">
              <span className="pdp-price-current">₹{product.price}</span>
              <span className="pdp-price-original">₹{originalPrice}</span>
              <span className="pdp-price-discount">20% OFF</span>
            </div>

            <div className="pdp-certifications">
              <span className="pdp-cert pdp-cert--gmp">
                <ShieldCheck size={12} /> WHO-GMP Certified
              </span>
              <span className="pdp-cert pdp-cert--veg">
                <Check size={12} /> 100% Veg
              </span>
              <span className="pdp-cert pdp-cert--fda">
                <Award size={12} /> USFDA Standard
              </span>
            </div>

            <p className="product-detail-short">{product.short_description}</p>
            {product.full_description && (
              <p className="product-detail-full">{product.full_description}</p>
            )}

            {benefits.length > 0 && (
              <div className="pdp-benefits-section">
                <h3 className="pdp-section-title">Key Benefits</h3>
                <div className="pdp-benefits-grid">
                  {benefits.map((item) => (
                    <div key={item} className="pdp-benefit-card">
                      <div className="pdp-benefit-icon">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className="pdp-benefit-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-actions-container">
              <button
                className={`pdp-btn pdp-btn--cart ${addedToCart ? 'pdp-btn--added' : ''}`}
                onClick={handleAddToCart}
                id="addToCartBtn"
              >
                <ShoppingCart size={16} />
                <span>{addedToCart ? 'Added! ✓' : 'Add to Cart'}</span>
              </button>
              <button
                className="pdp-btn pdp-btn--buy"
                onClick={handleBuyNow}
                id="buyNowBtn"
              >
                <CreditCard size={16} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Login nudge — shown if not logged in */}
            {!currentUser && (
              <div className="pg-pdp-login-nudge">
                <span>🔒</span>
                <span>
                  <Link to="/login">Sign in</Link> or <Link to="/login">create an account</Link> to purchase
                </span>
              </div>
            )}

            <div className="pdp-trust-section">
              <div className="pdp-trust-item">
                <ShieldCheck size={16} />
                <span>Secure Checkout</span>
              </div>
              <div className="pdp-trust-item">
                <Truck size={16} />
                <span>Free shipping above ₹999</span>
              </div>
              <div className="pdp-trust-item">
                <Award size={16} />
                <span>Pharma-grade quality</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="product-related-section container" style={{ marginTop: '80px', borderTop: '1px solid var(--line-soft)', paddingTop: '60px', paddingBottom: '80px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', marginBottom: '40px', color: 'var(--green-dark)', textAlign: 'center' }}>You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}