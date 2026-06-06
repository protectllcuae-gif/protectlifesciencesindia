import React, { useEffect, useState } from 'react'
import { db, storage } from '../../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const EMPTY_FORM = {
  name: '', slug: '', category: '', price: '', short_description: '',
  full_description: '', benefits: '', image_url: '', image_urls: [], is_featured: false
}

const PRESET_CATEGORIES = [
  'Weight Management',
  'Minerals & Vitamins',
  'Wellness',
  'Hair & Skin',
  'Immunity'
]

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [error, setError] = useState('')

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'))
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setError('')
    files.forEach((file) => {
      // Limit to 600 KB to comfortably fit within Firestore's 1 MB document limit
      if (file.size > 600 * 1024) {
        setError('Images must be smaller than 600 KB to be stored directly in Firestore.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageFiles((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (index) => {
    setForm((prev) => {
      const updatedUrls = (prev.image_urls || []).filter((_, i) => i !== index)
      return {
        ...prev,
        image_urls: updatedUrls
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Use Base64 image strings directly, bypassing Firebase Storage entirely
      const uploadedUrls = imageFiles

      const mergedUrls = [...(form.image_urls || []), ...uploadedUrls]

      const data = {
        ...form,
        price: parseFloat(form.price) || 0,
        image_url: mergedUrls[0] || '',
        image_urls: mergedUrls,
        updatedAt: serverTimestamp(),
      }
      
      // Clean dynamic fields from edit
      delete data.id

      if (editId) {
        await updateDoc(doc(db, 'products', editId), data)
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
      }
      await setDoc(doc(db, 'metadata', 'catalog'), { lastUpdated: Date.now() })
      localStorage.removeItem('pls_products_cache')
      setForm(EMPTY_FORM)
      setEditId(null)
      setImageFiles([])
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setForm({ ...EMPTY_FORM, ...product, image_urls: product.image_urls || (product.image_url ? [product.image_url] : []) })
    setEditId(product.id)
    setImageFiles([])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteDoc(doc(db, 'products', id))
      await setDoc(doc(db, 'metadata', 'catalog'), { lastUpdated: Date.now() })
      localStorage.removeItem('pls_products_cache')
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="admin-btn admin-btn--gold" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); setImageFiles([]) }}>
          {showForm ? '✕ Close Form' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="admin-panel" style={{ marginBottom: '28px' }}>
          <h2 className="admin-panel__title">{editId ? 'Edit Product' : 'Add New Product'}</h2>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid-2">
              <label>Product Name *<input name="name" value={form.name} onChange={(e) => { handleChange(e); if (!editId) setForm((p) => ({ ...p, slug: autoSlug(e.target.value) })) }} required placeholder="e.g. Vitamin C Gummies" /></label>
              <label>Slug *<input name="slug" value={form.slug} onChange={handleChange} required placeholder="e.g. vitamin-c-gummies" /></label>
            </div>
            <div className="admin-form-grid-3">
              <label>Category *
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">-- Select Category --</option>
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <label>Price (₹) *<input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="499" /></label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
                <input type="checkbox" name="is_featured" checked={!!form.is_featured} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                Featured Product
              </label>
            </div>
            <label>Short Description<input name="short_description" value={form.short_description} onChange={handleChange} placeholder="One-line summary" /></label>
            <label>Full Description<textarea name="full_description" value={form.full_description} onChange={handleChange} placeholder="Detailed product description..." rows={3} /></label>
            <label>Benefits (separate with |)<input name="benefits" value={form.benefits} onChange={handleChange} placeholder="Boosts immunity | Rich in Vitamin C | Sugar-free" /></label>
            
            <div style={{ marginTop: '10px' }}>
              <label style={{ marginBottom: '8px' }}>Product Images</label>
              
              {/* Existing Images */}
              {form.image_urls && form.image_urls.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px' }}>Uploaded Images:</span>
                  <div className="admin-image-grid">
                    {form.image_urls.map((url, index) => (
                      <div key={index} className="admin-image-item">
                        <img src={url} alt={`Existing ${index + 1}`} />
                        <button type="button" className="admin-image-remove-btn" onClick={() => handleRemoveExistingImage(index)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly Selected Images */}
              {imageFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px' }}>New Images to Upload:</span>
                  <div className="admin-image-grid">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="admin-image-item">
                        <img src={file} alt={`New ${index + 1}`} />
                        <button type="button" className="admin-image-remove-btn" onClick={() => handleRemoveNewImage(index)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <label style={{ display: 'block', cursor: 'pointer', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: '#e8c872', fontWeight: 600 }}>Click to Upload Photos</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Multiple images supported</span>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="admin-btn admin-btn--gold" disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setImageFiles([]) }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <h2 className="admin-panel__title">All Products</h2>
        {loading ? (
          <div className="spinner"></div>
        ) : products.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '32px 0' }}>No products found. Add your first product above.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-wrap admin-desktop-only">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img src={p.image_url} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', padding: '4px' }} />
                      </td>
                      <td>
                        <div style={{ color: '#e6edf3', fontWeight: 500 }}>{p.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{p.slug}</div>
                      </td>
                      <td>{p.category || '—'}</td>
                      <td><strong style={{ color: '#e8c872' }}>₹{p.price}</strong></td>
                      <td>
                        <span className={`admin-badge ${p.is_featured ? 'admin-badge--green' : 'admin-badge--yellow'}`}>
                          {p.is_featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleEdit(p)}>Edit</button>
                          <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-mobile-only admin-product-cards">
              {products.map((p) => (
                <div key={p.id} className="admin-product-card">
                  <div className="admin-product-card__header">
                    <div className="admin-product-card__profile">
                      <img src={p.image_url} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', padding: '4px', flexShrink: 0 }} />
                      <div>
                        <strong className="admin-product-card__name">{p.name}</strong>
                        <span className="admin-product-card__slug">{p.slug}</span>
                      </div>
                    </div>
                    <span className={`admin-badge ${p.is_featured ? 'admin-badge--green' : 'admin-badge--yellow'}`}>
                      {p.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </div>

                  <div className="admin-product-card__details">
                    <div>
                      <span className="admin-product-card__label">Category</span>
                      <span className="admin-product-card__val">{p.category || '—'}</span>
                    </div>
                    <div>
                      <span className="admin-product-card__label">Price</span>
                      <span className="admin-product-card__val" style={{ color: '#e8c872' }}>₹{p.price}</span>
                    </div>
                  </div>

                  <div className="admin-product-card__divider"></div>

                  <div className="admin-product-card__actions">
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}