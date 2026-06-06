import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function About() {
  return (
    <div className="about-page">
      <SEO 
        title="About Us | Scientific Nutraceutical Pioneers"
        description="Learn about Protect Life Sciences FZE LLC. Born in Dubai, trusted globally, now in India. Discover our pharmaceutical-grade nutraceutical gummies and strict WHO-GMP quality standards."
        keywords="about protect life sciences, premium health gummies manufacturers, dubai nutraceutical company, who-gmp certified gummies"
      />
      <section className="pg-page-hero" aria-label="About Protect Life Sciences">
        <div className="container">
          <Link className="pg-back-link" to="/" style={{ display: 'inline-block', marginBottom: '16px', color: '#e8c872', textDecoration: 'none' }}>← Back to home</Link>
          <p className="eyebrow">Our Story</p>
          <h1>Born in Dubai. Built for the World.</h1>
          <p>Protect Life Sciences FZE LLC — redefining wellness with pharmaceutical-grade nutraceutical gummies.</p>
        </div>
      </section>

      <section className="section container about-grid">
        <div className="about-story">
          <p className="eyebrow">The Origin</p>
          <h2>Who We Are</h2>
          <p>
            Founded in the UAE and driven by a vision to redefine wellness, Protect Life Sciences has pioneered
            premium gummy nutraceuticals that combine pharmaceutical-grade manufacturing with modern consumer preferences.
          </p>
          <p style={{ marginTop: '16px' }}>
            From the heart of Dubai's innovation ecosystem, we export our products to India and 20+ global markets,
            delivering science-backed wellness in every bite.
          </p>
          <p style={{ marginTop: '16px' }}>
            We believe that taking your daily supplements shouldn't feel like a chore. Our premium pharma-grade gummies
            deliver highly bioavailable nutrients in a format that is delicious, convenient, and easy to incorporate
            into any busy lifestyle.
          </p>
        </div>
        <div className="about-image-block">
          <div className="about-badge">🇦🇪 Sharjah, UAE</div>
          <div className="about-badge" style={{ marginTop: '12px' }}>🇮🇳 Serving India</div>
          <div className="about-badge" style={{ marginTop: '12px' }}>🌍 20+ Countries</div>
          <div className="about-badge" style={{ marginTop: '12px' }}>✅ WHO-GMP Certified</div>
        </div>
      </section>

      <section className="section about-certifications">
        <div className="container">
          <p className="eyebrow">Credentials</p>
          <h2>Manufacturing Standards</h2>
          <div className="cert-grid">
            <div className="cert-card">
              <h3>WHO-GMP</h3>
              <p>World Health Organization Good Manufacturing Practice Certified facilities ensuring highest quality.</p>
            </div>
            <div className="cert-card">
              <h3>USFDA Standards</h3>
              <p>Our processes align with United States Food &amp; Drug Administration standards for nutraceuticals.</p>
            </div>
            <div className="cert-card">
              <h3>Pharma Grade</h3>
              <p>Pharmaceutical-grade raw materials and rigorous quality control systems at every production step.</p>
            </div>
            <div className="cert-card">
              <h3>Export Ready</h3>
              <p>Compliant with import regulations across 20+ countries including India, GCC, and European markets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section container about-cta">
        <h2>Partner with Us</h2>
        <p>We welcome wholesale and B2B partnerships. Reach out to explore private label, export, and retail opportunities.</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
          <Link to="/contact" className="btn btn-gold">Contact Our Team</Link>
          <Link to="/shop" className="btn btn-outline-dark">Explore Products</Link>
        </div>
      </section>
    </div>
  )
}