import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { motion } from 'framer-motion'

const ADMIN_EMAILS = [
  'admin@protectgummies.com',
  'protectlifesciences@gmail.com',
  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean)

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [showPass, setShowPass] = useState(false)

  /* If already logged in as admin → redirect straight to /admin */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const emailLower = user.email?.toLowerCase()
        const isHardcodedAdmin = ADMIN_EMAILS.includes(emailLower)
        let isDbAdmin = false
        if (!isHardcodedAdmin) {
          try {
            const q = query(
              collection(db, 'team'),
              where('email', '==', emailLower),
              where('isAdmin', '==', true)
            )
            const snap = await getDocs(q)
            isDbAdmin = !snap.empty
          } catch (e) {
            console.error(e)
          }
        }
        if (isHardcodedAdmin || isDbAdmin) {
          navigate('/admin', { replace: true })
        }
      }
    })
    return () => unsub()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password)
      const signedEmail = result.user.email?.toLowerCase()

      const isHardcodedAdmin = ADMIN_EMAILS.includes(signedEmail)
      let isDbAdmin = false
      if (!isHardcodedAdmin) {
        const q = query(
          collection(db, 'team'),
          where('email', '==', signedEmail),
          where('isAdmin', '==', true)
        )
        const snap = await getDocs(q)
        isDbAdmin = !snap.empty
      }

      if (!isHardcodedAdmin && !isDbAdmin) {
        await auth.signOut()
        setError('This account does not have admin privileges.')
        setBusy(false)
        return
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      console.error(err)
      const msg = {
        'auth/user-not-found':   'No account found with this email.',
        'auth/wrong-password':   'Incorrect password. Please try again.',
        'auth/invalid-email':    'Invalid email address.',
        'auth/too-many-requests':'Too many failed attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password.',
      }
      setError(msg[err.code] || 'Sign-in failed. Please check your credentials.')
      setBusy(false)
    }
  }

  return (
    <div className="admin-login-page">
      {/* Background rings decoration */}
      <div className="admin-login-bg">
        <div className="admin-login-ring admin-login-ring--1" />
        <div className="admin-login-ring admin-login-ring--2" />
        <div className="admin-login-ring admin-login-ring--3" />
      </div>

      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="admin-login-logo">
          <div className="admin-login-logo__mark">PLS</div>
          <div className="admin-login-logo__text">
            <span>Protect Life Sciences</span>
            <small>Admin Dashboard</small>
          </div>
        </div>

        <div className="admin-login-divider" />

        <h1 className="admin-login-title">Welcome Back</h1>
        <p className="admin-login-sub">Sign in to access the admin panel</p>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label className="admin-login-label">
            <span>Admin Email</span>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">✉</span>
              <input
                id="adminEmail"
                type="email"
                className="admin-login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@protectgummies.com"
                required
                autoComplete="email"
              />
            </div>
          </label>

          {/* Password */}
          <label className="admin-login-label">
            <span>Password</span>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">🔒</span>
              <input
                id="adminPassword"
                type={showPass ? 'text' : 'password'}
                className="admin-login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </label>

          {/* Error */}
          {error && (
            <motion.div
              className="admin-login-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠ {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="adminLoginBtn"
            className="admin-login-btn"
            disabled={busy}
          >
            {busy ? (
              <span className="admin-login-spinner" />
            ) : (
              '🛡 Sign In to Admin'
            )}
          </button>
        </form>

        <div className="admin-login-divider" style={{ marginTop: '24px' }} />

        <p className="admin-login-back">
          <Link to="/">← Back to Website</Link>
        </p>
      </motion.div>
    </div>
  )
}
