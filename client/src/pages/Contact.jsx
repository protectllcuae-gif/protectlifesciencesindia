import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import SEO from '../components/SEO'

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      await addDoc(collection(db, 'enquiries'), {
        ...form,
        createdAt: serverTimestamp()
      })
      setStatus('success')
      setForm({ name: '', company: '', email: '', phone: '', message: '' })
    } catch (err) {
      console.error(err)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
      <SEO 
        title="Contact Us | Wholesale, Retail & Export Enquiries"
        description="Get in touch with Protect Life Sciences FZE LLC. Contact our offices in Dubai/UAE and India. Send business proposals, wholesale, and export enquiries."
        keywords="contact protect life sciences, wholesale gummies enquiries, export health supplements, dubai office contact"
      />
      <section className="pg-page-hero">
        <div className="container">
          <Link className="pg-back-link" to="/" style={{ display: 'inline-block', marginBottom: '16px', color: '#e8c872', textDecoration: 'none' }}>← Back to home</Link>
          <p className="eyebrow">Get In Touch</p>
          <h1>Contact Us</h1>
          <p>We welcome retail, wholesale, and export enquiries from around the world.</p>
        </div>
      </section>

      <section className="section container contact-grid">
        <div className="contact-info">
          <h2>Reach Us Directly</h2>
          <div className="contact-detail">
            <h4>🇦🇪 UAE Office</h4>
            <p>Protect Life Sciences FZE LLC</p>
            <p>Sharjah, United Arab Emirates</p>
            <p>📞 +971 567 464 623</p>
          </div>
          <div className="contact-detail">
            <h4>🇮🇳 India Sales</h4>
            <p>📞 +91 7385060011</p>
            <p>✉️ sales@protectgummies.com</p>
          </div>
          <div className="contact-detail">
            <h4>Business Hours</h4>
            <p>Mon – Sat: 9:00 AM – 6:00 PM IST</p>
            <p>Sunday: Closed</p>
          </div>
          <a
            href="https://wa.me/message/FNT7RORPWIDXD1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
            style={{ marginTop: '20px', display: 'inline-flex', gap: '8px' }}
          >
            💬 WhatsApp Us Directly
          </a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send an Enquiry</h2>
          {status === 'success' && (
            <div className="form-success">
              ✅ Thank you! We will get back to you within 24 hours.
            </div>
          )}
          {status === 'error' && (
            <div className="form-error">
              Something went wrong. Please try again or contact us via WhatsApp.
            </div>
          )}
          <div className="pg-form-grid-2">
            <label>
              Full Name *
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
            </label>
            <label>
              Company
              <input name="company" value={form.company} onChange={handleChange} placeholder="Company / Brand name" />
            </label>
          </div>
          <div className="pg-form-grid-2">
            <label>
              Email *
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXXXXXXX" />
            </label>
          </div>
          <label>
            Message *
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="Tell us about your requirements, quantity needed, target markets..."
              rows={5}
            ></textarea>
          </label>
          <button type="submit" className="btn btn-gold" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message →'}
          </button>
        </form>
      </section>
    </div>
  )
}