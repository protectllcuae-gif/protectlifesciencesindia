import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'
import SEO from '../components/SEO'

export default function Shop() {
  const { products: contextProducts, categories: contextCategories, loading } = useProducts()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [categoriesList, setCategoriesList] = useState(['All'])

  useEffect(() => {
    if (contextProducts) {
      setFilteredProducts(contextProducts)
    }
    if (contextCategories) {
      setCategoriesList(contextCategories)
    }
  }, [contextProducts, contextCategories])

  useEffect(() => {
    if (!contextProducts) return
    let result = contextProducts
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.short_description && p.short_description.toLowerCase().includes(query)) ||
          (p.full_description && p.full_description.toLowerCase().includes(query))
      )
    }
    setFilteredProducts(result)
  }, [searchQuery, selectedCategory, contextProducts])

  useEffect(() => {
    if (loading) return
    const targets = Array.from(document.querySelectorAll('.product-card'))
    targets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll')
      el.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 80, 320)}ms`)
    })
    if (!window.IntersectionObserver) { targets.forEach((t) => t.classList.add('is-visible')); return }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [loading, filteredProducts])

  return (
    <div className="shop-page">
      <SEO 
        title="Shop Gummies | Premium Nutraceutical Catalog"
        description="Explore the complete range of scientific health and wellness gummies from Protect Life Sciences. Shop Vitamin C, Biotin, Melatonin, Shilajit, and more."
        keywords="shop gummies, buy nutraceutical gummies, multivitamin gummies, biotin, melatonin sleep, shilajit gummies"
      />
      <section className="pg-page-hero" aria-label="Gummy Catalog Hero">
        <div className="container">
          <Link className="pg-back-link" to="/" style={{ display: 'inline-block', marginBottom: '16px', color: '#e8c872', textDecoration: 'none' }}>← Back to home</Link>
          <p className="eyebrow">Shop</p>
          <h1>The Science of Health. The Joy of Taste.</h1>
          <p>Explore our complete nutraceutical gummy range for Indian consumers.</p>
        </div>
      </section>

      <div className="section container">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search gummies by name or benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {categoriesList && categoriesList.length > 1 && (
          <div className="category-tabs">
            {categoriesList.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="message" style={{ textAlign: 'center' }}>Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="message" style={{ textAlign: 'center', padding: '40px 0' }}>
            No gummies found matching your criteria.
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}