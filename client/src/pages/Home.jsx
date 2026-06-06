import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'
import SEO from '../components/SEO'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [carouselIndex, setCarouselIndex] = useState(0)

  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917385060011'
  const cleanNumber = rawNumber.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanNumber}`

  const heroRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    const bg = bgRef.current
    if (!hero || !bg) return

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null

    const applyTransform = () => {
      const scrollOffset = Math.min(window.scrollY, hero.offsetHeight) * 0.08
      bg.style.transform = `scale(1.1) translate3d(${currentX}px, ${currentY + scrollOffset}px, 0)`
    }
    const tick = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08
      applyTransform()
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(tick)
      } else {
        rafId = null
      }
    }
    const queueTick = () => { if (rafId === null) rafId = requestAnimationFrame(tick) }
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 18
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 12
      queueTick()
    }
    const handleMouseLeave = () => { targetX = 0; targetY = 0; queueTick() }
    const handleScroll = () => queueTick()

    hero.addEventListener('mousemove', handleMouseMove, { passive: true })
    hero.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    applyTransform()
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove)
      hero.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const { products: contextProducts, loading } = useProducts()

  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      const feat = contextProducts.filter((p) => p.is_featured === 1 || p.is_featured === true)
      setFeaturedProducts(feat.length > 0 ? feat : contextProducts.slice(0, 4))
    }
  }, [contextProducts])

  useEffect(() => {
    if (featuredProducts.length < 2) return
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredProducts.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [featuredProducts])

  useEffect(() => {
    if (loading) return
    const selectors = ['.trust-bar', '.brand-strip', '.cta-band', '.section', '.product-card', '.feature-tile', '.why-choose-hero']
    const targets = Array.from(document.querySelectorAll(selectors.join(',')))
    targets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll')
      el.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 90, 450)}ms`)
    })
    if (!window.IntersectionObserver) { targets.forEach((t) => t.classList.add('is-visible')); return }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      }),
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [loading, featuredProducts])

  const getCarouselCardClass = (index) => {
    const total = featuredProducts.length
    const offset = (index - carouselIndex + total) % total
    if (offset === 0) return 'is-active'
    if (offset === 1) return 'is-stack-1'
    if (offset === 2) return 'is-stack-2'
    return 'is-hidden-stack'
  }
  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % featuredProducts.length)

  return (
    <div className="home-wrapper">
      <SEO 
        title="Premium Scientific Nutraceutical Gummies"
        description="Discover the science of wellness with Protect Life Sciences. Premium nutraceutical gummies formulated with scientific backing, crafted for taste and health."
        keywords="nutraceutical, gummies, health gummies, stamina gummies, vitamin c, melatonine sleep, garcinia cambogia, protect life sciences"
      />
      <section className="home-hero is-ready" id="homeHero" ref={heroRef} aria-label="Dubai Skyline Hero">
        <div className="home-hero__bg" id="heroParallaxBg" ref={bgRef}></div>
        <div className="home-hero__overlay"></div>
        <div className="container home-hero__inner">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow hero-animate">United Arab Emirates</p>
            <p className="home-hero__city hero-animate hero-animate--delay-1">Dubai</p>
            <h1 className="home-hero__title hero-animate hero-animate--delay-2">
              Protecting Wellness Through <span className="home-hero__title-accent">Quality</span> Gummies
            </h1>
            <p className="home-hero__desc hero-animate hero-animate--delay-3">
              Born in Dubai and trusted across global markets. Premium nutraceutical gummies crafted with
              pharmaceutical-grade standards for customers in India and beyond.
            </p>
            <div className="home-hero__actions hero-animate hero-animate--delay-4">
              <Link to="/shop" className="home-hero__btn home-hero__btn--primary">
                Explore Products
                <span className="home-hero__btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/contact" className="home-hero__btn home-hero__btn--outline">Export Inquiry</Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="home-hero__btn home-hero__btn--whatsapp">
                <span className="home-hero__wa-icon" aria-hidden="true">✆</span>
                WhatsApp Us
              </a>
            </div>
          </div>
          <div className="home-hero__cards-wrap">
            {featuredProducts.length > 0 && (
              <div className="home-hero__carousel" aria-label="Featured products">
                <div className="home-hero__carousel-track">
                  {featuredProducts.map((p, index) => (
                    <Link key={p.id} to={`/product/${p.slug}`}
                      className={`home-hero__card ${getCarouselCardClass(index)}`}
                      aria-hidden={getCarouselCardClass(index) !== 'is-active'}
                    >
                      <div className="home-hero__card-image"><img src={p.image_url} alt={p.name} /></div>
                      <div className="home-hero__card-body">
                        <h2>{p.name}</h2>
                        <p>{p.category?.toUpperCase() || 'WELLNESS'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {featuredProducts.length > 1 && (
                  <div className="home-hero__carousel-controls">
                    <button type="button" className="home-hero__carousel-btn" onClick={handlePrev} aria-label="Previous product">‹</button>
                    <div className="home-hero__carousel-dots">
                      {featuredProducts.map((_, index) => (
                        <button key={index} type="button"
                          className={`home-hero__carousel-dot ${index === carouselIndex ? 'is-active' : ''}`}
                          onClick={() => setCarouselIndex(index)}
                          aria-label={`Show slide ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                    <button type="button" className="home-hero__carousel-btn" onClick={handleNext} aria-label="Next product">›</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll Hint — inside hero so position:absolute works */}
        <div className="home-hero__scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="home-hero__scroll-mouse">
            <div className="home-hero__scroll-dot" />
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="trust-marquee">
          <div className="trust-marquee__track">
            <span className="trust-marquee__item">◆ Orders above ₹999 across India</span>
            <span className="trust-marquee__item">◆ WHO-GMP certified · USFDA standards</span>
            <span className="trust-marquee__item">◆ Born in Dubai · Exported to 20+ countries</span>
            <span className="trust-marquee__item">◆ Pharma-grade gummies — pure science, delicious</span>
            <span className="trust-marquee__item">◆ Orders above ₹999 across India</span>
            <span className="trust-marquee__item">◆ WHO-GMP certified · USFDA standards</span>
            <span className="trust-marquee__item">◆ Born in Dubai · Exported to 20+ countries</span>
            <span className="trust-marquee__item">◆ Pharma-grade gummies — pure science, delicious</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Featured Products</h2>
          <Link to="/shop" className="text-link">View all products</Link>
        </div>
        {loading ? (
          <div className="message" style={{ textAlign: 'center' }}>Loading featured products...</div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </section>

      <section className="brand-strip">
        <div className="container"><p>Born in Dubai. Trusted Globally. Now in India.</p></div>
      </section>

      <section className="why-choose-hero">
        <div className="why-choose-hero__bg"></div>
        <div className="why-choose-hero__overlay"></div>
        <div className="container why-choose-hero__inner">
          <div className="why-choose-hero__content">
            <p className="why-choose-hero__eyebrow">The Science of Health</p>
            <h2 className="why-choose-hero__title">Why Choose Us</h2>
            <p className="why-choose-hero__tagline">Born in Dubai. Trusted Globally. Now in India.</p>
          </div>
          <div className="why-choose-hero__carousel-wrap">
            <div className="why-choose-hero__flowing-carousel" aria-label="Why choose us reasons">
              <div className="why-choose-hero__flowing-track">
                {[
                  { title: 'Manufacturing Excellence', desc: 'Built on pharmaceutical quality systems and strict process controls.' },
                  { title: 'Global Export Expertise', desc: 'Trusted logistics and compliance across international markets.' },
                  { title: 'Innovation-Driven', desc: 'Modern nutraceutical formats designed for real-world adherence.' },
                  { title: 'End-to-End Reliability', desc: 'From R&D to final packaging, quality is protected at every step.' },
                  { title: 'Manufacturing Excellence', desc: 'Built on pharmaceutical quality systems and strict process controls.' },
                  { title: 'Global Export Expertise', desc: 'Trusted logistics and compliance across international markets.' },
                  { title: 'Innovation-Driven', desc: 'Modern nutraceutical formats designed for real-world adherence.' }
                ].map((item, i) => (
                  <article key={i} className="why-choose-hero__flowing-slide">
                    <div className="why-choose-hero__slide-header"><h3>{item.title}</h3></div>
                    <p>{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="coming-soon-banner">
          <span className="coming-soon-badge">🎉 Coming Soon</span>
          <p>New formulations and exciting products launching soon!</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-wrap">
          <h2>The Science of Health. The Joy of Taste.</h2>
          <Link to="/shop" className="btn btn-gold">Shop Now</Link>
        </div>
      </section>
    </div>
  )
}