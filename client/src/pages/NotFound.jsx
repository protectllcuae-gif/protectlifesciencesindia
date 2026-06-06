import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="not-found-inner">
        <p className="eyebrow">404</p>
        <h1>Page Not Found</h1>
        <p className="not-found-desc">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-gold">← Back to Home</Link>
          <Link to="/shop" className="btn btn-outline-dark">Browse Products</Link>
        </div>
      </div>
    </section>
  )
}
