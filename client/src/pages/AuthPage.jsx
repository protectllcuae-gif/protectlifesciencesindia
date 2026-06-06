import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, signInWithGoogle } from '../firebase'

/* ── Admin email whitelist (same as Admin.jsx) ── */
const ADMIN_EMAILS = [
  'admin@protectgummies.com',
  'protectlifesciences@gmail.com',
  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean)

/* ── Error message mapper ── */
const authError = (code) => ({
  'auth/user-not-found':      'No account found with this email.',
  'auth/wrong-password':      'Incorrect password. Please try again.',
  'auth/invalid-credential':  'Invalid email or password.',
  'auth/email-already-in-use':'This email is already registered.',
  'auth/weak-password':       'Password must be at least 6 characters.',
  'auth/invalid-email':       'Please enter a valid email address.',
  'auth/too-many-requests':   'Too many attempts. Try again later.',
  'auth/popup-closed-by-user':'Google sign-in was cancelled.',
}[code] || 'Something went wrong. Please try again.')

/* ── Shared input row ── */
function Field({ label, type = 'text', value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <label className="auth2-label">
      <span>{label}</span>
      <div className="auth2-input-wrap">
        <input
          id={id}
          type={isPass && show ? 'text' : type}
          className="auth2-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={isPass ? 'current-password' : type === 'email' ? 'email' : 'off'}
        />
        {isPass && (
          <button type="button" className="auth2-eye" onClick={() => setShow(!show)}
            aria-label={show ? 'Hide' : 'Show'}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
    </label>
  )
}

/* ════════════════════════════════════
   CUSTOMER PANEL  (Login + Signup)
════════════════════════════════════ */
function CustomerPanel({ navigate }) {
  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [success, setSuccess]   = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true); reset()
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        navigate('/dashboard', { replace: true })
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await setDoc(doc(db, 'customers', cred.user.uid), {
          name, email: email.trim(), role: 'customer', createdAt: serverTimestamp()
        })
        setSuccess('Account created! Taking you to your dashboard…')
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
      }
    } catch (err) {
      setError(authError(err.code))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setBusy(true); reset()
    try {
      await signInWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(authError(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth2-panel">
      {/* Mode switcher pills */}
      <div className="auth2-mode-switch">
        <button
          type="button"
          className={`auth2-mode-btn ${mode === 'login' ? 'auth2-mode-btn--active' : ''}`}
          onClick={() => { setMode('login'); reset() }}
        >Sign In</button>
        <button
          type="button"
          className={`auth2-mode-btn ${mode === 'signup' ? 'auth2-mode-btn--active' : ''}`}
          onClick={() => { setMode('signup'); reset() }}
        >Create Account</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <p className="auth2-sub">
            {mode === 'login'
              ? 'Welcome back! Sign in to your customer account.'
              : 'Create a free account to order and track your wellness products.'}
          </p>

          <form className="auth2-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <Field id="custName" label="Full Name" value={name}
                onChange={e => setName(e.target.value)} placeholder="Your full name" />
            )}
            <Field id="custEmail" label="Email Address" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field id="custPassword" label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'} />

            {error   && <div className="auth2-error">⚠ {error}</div>}
            {success && <div className="auth2-success">✅ {success}</div>}

            <button type="submit" className="auth2-btn auth2-btn--green" disabled={busy}>
              {busy
                ? <span className="auth2-spinner" />
                : mode === 'login' ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          <div className="auth2-divider"><span>or continue with</span></div>

          <button type="button" className="auth2-google-btn" onClick={handleGoogle} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ════════════════════════════════════
   ADMIN PANEL  (Login only)
════════════════════════════════════ */
function AdminPanel({ navigate }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password)
      const signedEmail = result.user.email?.toLowerCase()
      if (!ADMIN_EMAILS.includes(signedEmail)) {
        await auth.signOut()
        setError('This account does not have admin privileges.')
        setBusy(false)
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(authError(err.code))
      setBusy(false)
    }
  }

  return (
    <div className="auth2-panel auth2-panel--admin">
      <div className="auth2-admin-badge">
        <span className="auth2-admin-badge__icon">🛡</span>
        <div>
          <strong>Admin Access</strong>
          <p>Restricted to authorised personnel only</p>
        </div>
      </div>

      <p className="auth2-sub" style={{ marginTop: 0 }}>
        Sign in with your administrator credentials to access the PLS dashboard.
      </p>

      <form className="auth2-form" onSubmit={handleSubmit} noValidate>
        <Field id="adminEmail" label="Admin Email" type="email"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="admin@protectgummies.com" />
        <Field id="adminPassword" label="Password" type="password"
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Admin password" />

        {error && <div className="auth2-error">⚠ {error}</div>}

        <button type="submit" className="auth2-btn auth2-btn--gold" disabled={busy}>
          {busy
            ? <span className="auth2-spinner auth2-spinner--dark" />
            : '🛡 Sign In to Admin'}
        </button>
      </form>
    </div>
  )
}

/* ════════════════════════════════════
   MAIN AUTH PAGE
════════════════════════════════════ */
export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Allow ?tab=admin to deep-link directly to admin panel
  const defaultTab = searchParams.get('tab') === 'admin' ? 'admin' : 'customer'
  const [tab, setTab] = useState(defaultTab)

  /* Redirect if already logged in */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return
      const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase())
      if (isAdmin) navigate('/admin', { replace: true })
      else navigate('/dashboard', { replace: true })
    })
    return () => unsub()
  }, [navigate])

  return (
    <div className="auth2-page">
      {/* Decorative background */}
      <div className="auth2-bg" aria-hidden="true">
        <div className="auth2-bg__blob auth2-bg__blob--1" />
        <div className="auth2-bg__blob auth2-bg__blob--2" />
      </div>

      <motion.div
        className="auth2-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="auth2-header">
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <Link className="pg-back-link" to="/" style={{ color: 'var(--green-mid)', textDecoration: 'none', fontWeight: 600 }}>← Back to home</Link>
          </div>
          <div className="auth2-logo-container">
            <Link to="/" aria-label="Home">
              <img src="/images/protect-logo.png" alt="Protect Logo" className="auth2-logo-centered-img" />
            </Link>
          </div>
          <h1 className="auth2-title">
            {tab === 'customer' ? 'Your Account' : 'Admin Portal'}
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="auth2-tabs" role="tablist" aria-label="Account type">
          <button
            role="tab"
            aria-selected={tab === 'customer'}
            className={`auth2-tab ${tab === 'customer' ? 'auth2-tab--active' : ''}`}
            onClick={() => setTab('customer')}
          >
            <span className="auth2-tab__icon">🛍</span>
            <span>Customer</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'admin'}
            className={`auth2-tab ${tab === 'admin' ? 'auth2-tab--active auth2-tab--admin' : ''}`}
            onClick={() => setTab('admin')}
          >
            <span className="auth2-tab__icon">🛡</span>
            <span>Admin</span>
          </button>
        </div>

        {/* Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'customer' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'customer' ? 20 : -20 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'customer'
              ? <CustomerPanel navigate={navigate} />
              : <AdminPanel navigate={navigate} />
            }
          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        <p className="auth2-footer-note">
          <Link to="/">← Back to website</Link>
          {tab === 'admin' && (
            <span> · <Link to="/admin">Go to Dashboard</Link></span>
          )}
        </p>
      </motion.div>
    </div>
  )
}
