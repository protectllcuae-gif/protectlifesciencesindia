import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'

const EMPTY = { code: '', discount: '', type: 'percentage', minOrder: '', maxUses: '', active: true }

export default function CouponManager() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, 'coupons'))
      setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, discount: parseFloat(form.discount), minOrder: parseFloat(form.minOrder) || 0, maxUses: parseInt(form.maxUses) || 0 }
      if (editId) {
        await updateDoc(doc(db, 'coupons', editId), { ...data, updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'coupons'), { ...data, usedCount: 0, createdAt: serverTimestamp() })
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); fetchCoupons()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    await deleteDoc(doc(db, 'coupons', id))
    fetchCoupons()
  }

  const handleToggle = async (coupon) => {
    await updateDoc(doc(db, 'coupons', coupon.id), { active: !coupon.active })
    fetchCoupons()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="admin-btn admin-btn--gold" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY) }}>
          {showForm ? '✕ Close' : '+ New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="admin-panel" style={{ marginBottom: '24px' }}>
          <h2 className="admin-panel__title">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid-2">
              <label>Coupon Code *<input name="code" value={form.code} onChange={handleChange} required placeholder="PROTECT20" style={{ textTransform: 'uppercase' }} /></label>
              <label>Discount Type
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>
            </div>
            <div className="admin-form-grid-3">
              <label>Discount Value *<input name="discount" type="number" value={form.discount} onChange={handleChange} required placeholder={form.type === 'percentage' ? '20' : '100'} /></label>
              <label>Min. Order (₹)<input name="minOrder" type="number" value={form.minOrder} onChange={handleChange} placeholder="500" /></label>
              <label>Max Uses (0 = unlimited)<input name="maxUses" type="number" value={form.maxUses} onChange={handleChange} placeholder="100" /></label>
            </div>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
              Active (customers can use this coupon)
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="admin-btn admin-btn--gold" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create Coupon'}</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <h2 className="admin-panel__title">All Coupons</h2>
        {loading ? <div className="spinner"></div> : coupons.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '32px 0' }}>No coupons yet.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-wrap admin-desktop-only">
              <table className="admin-table">
                <thead><tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Used / Max</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><strong style={{ color: '#e8c872', letterSpacing: '1px' }}>{c.code}</strong></td>
                      <td style={{ color: 'rgba(255,255,255,0.6)' }}>{c.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                      <td><strong style={{ color: '#e6edf3' }}>{c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`}</strong></td>
                      <td>{c.minOrder ? `₹${c.minOrder}` : 'None'}</td>
                      <td>{c.usedCount || 0} / {c.maxUses || '∞'}</td>
                      <td>
                        <span className={`admin-badge ${c.active ? 'admin-badge--green' : 'admin-badge--red'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setForm({ code: c.code, discount: c.discount, type: c.type, minOrder: c.minOrder || '', maxUses: c.maxUses || '', active: c.active }); setEditId(c.id); setShowForm(true) }}>Edit</button>
                          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleToggle(c)}>{c.active ? 'Disable' : 'Enable'}</button>
                          <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(c.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-mobile-only admin-coupon-cards">
              {coupons.map((c) => (
                <div key={c.id} className="admin-coupon-card">
                  <div className="admin-coupon-card__header">
                    <div>
                      <strong className="admin-coupon-card__code">{c.code}</strong>
                      <span className="admin-coupon-card__type">
                        {c.type === 'percentage' ? 'Percentage' : 'Fixed'} &bull; {c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`}
                      </span>
                    </div>
                    <span className={`admin-badge ${c.active ? 'admin-badge--green' : 'admin-badge--red'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="admin-coupon-card__details">
                    <div>
                      <span className="admin-coupon-card__label">Min Order</span>
                      <span className="admin-coupon-card__val">{c.minOrder ? `₹${c.minOrder}` : 'None'}</span>
                    </div>
                    <div>
                      <span className="admin-coupon-card__label">Used / Max</span>
                      <span className="admin-coupon-card__val">{c.usedCount || 0} / {c.maxUses || '∞'}</span>
                    </div>
                  </div>

                  <div className="admin-coupon-card__divider"></div>

                  <div className="admin-coupon-card__actions">
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setForm({ code: c.code, discount: c.discount, type: c.type, minOrder: c.minOrder || '', maxUses: c.maxUses || '', active: c.active }); setEditId(c.id); setShowForm(true) }}>Edit</button>
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleToggle(c)}>{c.active ? 'Disable' : 'Enable'}</button>
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(c.id)}>Delete</button>
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