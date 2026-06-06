import React, { useState, useEffect } from 'react'
import { Plus, Trash, Shield, Key } from 'lucide-react'
import { db } from '../../firebase'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'

export default function TeamManager() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [busy, setBusy] = useState(false)

  const fetchTeam = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'team'))
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTeam(list)
    } catch (err) {
      console.error("Error fetching team: ", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name || !role || !email) return
    setBusy(true)
    try {
      const newMember = {
        name,
        role,
        email: email.trim().toLowerCase(),
        isAdmin: !!isAdmin
      }
      const docRef = await addDoc(collection(db, 'team'), newMember)
      setTeam([...team, { id: docRef.id, ...newMember }])
      setName('')
      setRole('')
      setEmail('')
      setIsAdmin(false)
    } catch (err) {
      console.error("Error adding team member: ", err)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team profile?')) return
    try {
      await deleteDoc(doc(db, 'team', id))
      setTeam(team.filter(t => t.id !== id))
    } catch (err) {
      console.error("Error deleting team member: ", err)
    }
  }

  const handleToggleAdmin = async (member) => {
    try {
      const nextAdminState = !member.isAdmin
      await updateDoc(doc(db, 'team', member.id), { isAdmin: nextAdminState })
      setTeam(team.map(t => t.id === member.id ? { ...t, isAdmin: nextAdminState } : t))
    } catch (err) {
      console.error("Error toggling admin state: ", err)
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">System Authority & Team Profiles</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '25px' }}>
        Add scientific board members, regulatory officers, and administrative team members. Manage admin login authority here.
      </p>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="admin-form-grid-2">
          <div>
            <form className="admin-form" onSubmit={handleAdd}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#e8c872' }}>Add Authority Profile</h3>
              
              <label>
                Name *
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Robert Vance" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </label>

              <label>
                Role / Designation *
                <input 
                  type="text" 
                  placeholder="e.g. Lead Formulator" 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  required 
                />
              </label>

              <label>
                Email Address *
                <input 
                  type="email" 
                  placeholder="e.g. robert@protectgummies.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </label>

              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', textTransform: 'none', letterSpacing: 'normal', fontSize: '12px', color: '#e6edf3', cursor: 'pointer', margin: '8px 0' }}>
                <input 
                  type="checkbox" 
                  checked={isAdmin} 
                  onChange={e => setIsAdmin(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Grant Admin Dashboard Access
              </label>

              <button type="submit" className="admin-btn admin-btn--gold" style={{ marginTop: '8px' }} disabled={busy}>
                {busy ? 'Adding...' : <><Plus size={16} /> Add Profile</>}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e6edf3' }}>Active Authority Profiles</h3>
            {/* Desktop Table View */}
            <div className="admin-table-wrap admin-desktop-only">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Role & Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <Shield size={18} style={{ color: t.isAdmin ? '#e8c872' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '13px', color: '#e6edf3' }}>
                              {t.name}
                            </strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                              {t.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#e6edf3' }}>{t.role}</span>
                          {t.isAdmin && (
                            <span className="admin-badge admin-badge--green" style={{ width: 'fit-content', fontSize: '8px', padding: '2px 6px' }}>
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className={`admin-btn admin-btn--sm ${t.isAdmin ? 'admin-btn--ghost' : 'admin-btn--gold'}`}
                            onClick={() => handleToggleAdmin(t)}
                            title={t.isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
                            style={{ padding: '6px 8px' }}
                          >
                            <Key size={12} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            onClick={() => handleDelete(t.id)}
                            title="Delete Profile"
                            style={{ padding: '6px 8px' }}
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {team.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>
                        No authority profiles added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-mobile-only admin-team-cards">
              {team.map(t => (
                <div key={t.id} className="admin-team-card">
                  <div className="admin-team-card__header">
                    <div className="admin-team-card__profile">
                      <Shield size={18} style={{ color: t.isAdmin ? '#e8c872' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                      <div>
                        <strong className="admin-team-card__name">{t.name}</strong>
                        <span className="admin-team-card__email">{t.email}</span>
                      </div>
                    </div>
                    <div className="admin-team-card__actions">
                      <button
                        type="button"
                        className={`admin-btn admin-btn--sm ${t.isAdmin ? 'admin-btn--ghost' : 'admin-btn--gold'}`}
                        onClick={() => handleToggleAdmin(t)}
                        title={t.isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
                        style={{ padding: '6px 8px' }}
                      >
                        <Key size={12} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => handleDelete(t.id)}
                        title="Delete Profile"
                        style={{ padding: '6px 8px' }}
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="admin-team-card__divider"></div>
                  <div className="admin-team-card__footer">
                    <span className="admin-team-card__role">{t.role}</span>
                    {t.isAdmin && (
                      <span className="admin-badge admin-badge--green" style={{ fontSize: '8px', padding: '2px 6px' }}>
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {team.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
                  No authority profiles added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}