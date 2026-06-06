import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link
        to={`/product/${product.slug}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        <div className="product-card-image">
          <img src={product.image_url} alt={product.name} loading="lazy" />
          {/* Hover overlay with CTA */}
          <div className="product-card-overlay" aria-hidden="true">
            <span className="product-card-overlay-btn">View Product</span>
          </div>
        </div>
      </Link>

      <div className="product-card-body">
        {product.category && (
          <span className="product-card-category">{product.category}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.short_description}</p>
        <div className="product-card-footer">
          <strong className="price">₹{product.price?.toLocaleString()}</strong>
          <Link to={`/product/${product.slug}`} className="btn btn-outline-dark" style={{ fontSize: '10px', padding: '9px 18px' }}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}