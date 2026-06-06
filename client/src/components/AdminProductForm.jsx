import React, { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const emptyForm = {
  name: '',
  slug: '',
  short_description: '',
  full_description: '',
  ingredients: '',
  benefits: '',
  price: 0,
  image_url: '',
  category: 'General',
  is_featured: false,
}

export default function AdminProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        price: product.price || 0,
        is_featured: Boolean(product.is_featured),
      })
    } else {
      setForm(emptyForm)
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSlugChange = (e) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    setForm((current) => ({
      ...current,
      slug: sanitized,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    // Generate or clean slug
    const generatedSlug = (form.slug || form.name)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!generatedSlug) {
      alert('A valid product slug is required.')
      setSaving(false)
      return
    }

    try {
      const productId = product?.id || generatedSlug
      const productData = {
        ...form,
        slug: generatedSlug,
        price: Number(form.price),
        is_featured: form.is_featured ? 1 : 0,
      }
      await setDoc(doc(db, 'products', productId), productData)
      onSaved({ id: productId, ...productData })
      setForm(emptyForm)
    } catch (error) {
      console.error('Failed to save product details to Firestore', error)
      alert('Unable to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid-2">
        <label>
          Product Name *
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => {
              handleChange(e)
              if (!product) {
                // Auto-generate slug for new products
                const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
                setForm(prev => ({ ...prev, slug: autoSlug }))
              }
            }}
            required
          />
        </label>
        <label>
          Product Slug (URL part) *
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="e.g. kids-multivitamin-gummies"
            required
          />
        </label>
      </div>

      <div className="admin-form-grid-3">
        <label>
          Price (INR) *
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            required
          />
        </label>
        <label>
          Category *
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Wellness">Wellness</option>
            <option value="Kids">Kids</option>
            <option value="Adult">Adult</option>
            <option value="Beauty">Beauty</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '100%', paddingTop: '24px' }}>
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
            style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer' }}
          />
          Featured Product
        </label>
      </div>

      <label>
        Image URL *
        <input
          type="url"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          required
        />
      </label>

      {form.image_url && (
        <div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Image Preview</span>
          <img src={form.image_url} alt="Preview" className="admin-img-preview" />
        </div>
      )}

      <label>
        Short Description *
        <input
          type="text"
          name="short_description"
          value={form.short_description}
          onChange={handleChange}
          placeholder="Brief 1-sentence product summary"
          required
        />
      </label>

      <label>
        Full Description *
        <textarea
          name="full_description"
          value={form.full_description}
          onChange={handleChange}
          placeholder="Detailed description of benefits, usage, etc."
          required
        />
      </label>

      <label>
        Ingredients
        <textarea
          name="ingredients"
          value={form.ingredients}
          onChange={handleChange}
          placeholder="List ingredients separated by commas"
        />
      </label>

      <label>
        Benefits List (separated by |)
        <textarea
          name="benefits"
          value={form.benefits}
          onChange={handleChange}
          placeholder="e.g. Boosts Immunity | Pure Organic | 100% Vegan"
        />
      </label>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button type="submit" className="admin-btn admin-btn--gold" disabled={saving}>
          {saving ? 'Saving...' : 'Save Product'}
        </button>
        {onCancel && (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}