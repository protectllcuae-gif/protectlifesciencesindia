import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ticket,
  Users,
  BarChart3,
  ShoppingCart,
  LayoutDashboard,
  FileText,
  Star,
  ArrowLeft,
  LogOut
} from 'lucide-react'

// Modular Components
import ProductManager from '../components/admin/ProductManager'
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard'
import CouponManager from '../components/admin/CouponManager'
import ReviewManager from '../components/admin/ReviewManager'
import BlogManager from '../components/admin/BlogManager'
import TeamManager from '../components/admin/TeamManager'

const ADMIN_EMAILS = [
  'admin@protectgummies.com',
  'protectlifesciences@gmail.com',
  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean)

const NAV_TABS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'products',  label: 'Products',  icon: ShoppingCart },
  { id: 'orders',    label: 'Orders',    icon: LayoutDashboard },
  { id: 'coupons',   label: 'Coupons',   icon: Ticket },
  { id: 'reviews',   label: 'Reviews',   icon: Star },
  { id: 'blogs',     label: 'Blog',      icon: FileText },
  { id: 'team',      label: 'Team',      icon: Users },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const email = currentUser.email?.toLowerCase()
        const isHardcodedAdmin = ADMIN_EMAILS.includes(email)
        let isDbAdmin = false
        if (!isHardcodedAdmin) {
          try {
            const q = query(
              collection(db, 'team'),
              where('email', '==', email),
              where('isAdmin', '==', true)
            )
            const snap = await getDocs(q)
            isDbAdmin = !snap.empty
          } catch (err) {
            console.error('Error checking db admin status:', err)
          }
        }
        setIsAdmin(isHardcodedAdmin || isDbAdmin)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAdmin || activeTab !== 'orders') return
    setOrdersLoading(true)
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrders()
  }, [isAdmin, activeTab])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try {
      await deleteDoc(doc(db, 'orders', orderId))
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      console.error('Error deleting order:', err)
      alert('Failed to delete order')
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="admin-new-access">
        <div className="admin-new-access-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ borderTopColor: '#10B981' }}></div>
          <p className="admin-new-access-msg" style={{ margin: 0 }}>Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-new-access">
        <div className="admin-new-access-card">
          <div className="admin-new-access-logo">PLS Admin</div>
          <p className="admin-new-access-sub">Admin Dashboard</p>
          <p className="admin-new-access-msg">Please log in with your admin account to access the dashboard.</p>
          <Link to="/admin-login" className="admin-new-btn admin-new-btn--gold" style={{ display: 'inline-flex', width: '100%', textDecoration: 'none' }}>
            Go to Admin Login
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-new-access">
        <div className="admin-new-access-card">
          <div className="admin-new-access-logo">Access Denied</div>
          <p className="admin-new-access-sub">Unauthorized</p>
          <p className="admin-new-access-msg">Your account ({user.email}) does not have admin privileges.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <Link to="/" className="admin-new-btn admin-new-btn--ghost" style={{ textDecoration: 'none' }}>
              Return to Website
            </Link>
            <button className="admin-new-btn admin-new-btn--danger" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderOrdersTab = () => (
    <div className="admin-new-panel">
      <h2 className="admin-new-panel-title">Order Management</h2>
      {ordersLoading ? (
        <div className="spinner" style={{ margin: '40px auto' }}></div>
      ) : orders.length === 0 ? (
        <p className="admin-new-empty-msg">No orders yet.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-new-table-wrap admin-desktop-only">
            <table className="admin-new-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong style={{ color: '#10B981' }}>#{order.id.slice(-6).toUpperCase()}</strong></td>
                    <td>
                      <div className="admin-new-customer-name">{order.name || order.customerName || '—'}</div>
                      <div className="admin-new-customer-email">{order.email || '—'}</div>
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(', ') || '—'}
                    </td>
                    <td><strong style={{ color: '#ffffff' }}>₹{order.total?.toLocaleString() || '—'}</strong></td>
                    <td>{order.city || '—'}</td>
                    <td>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`admin-status-select ${
                          (order.status === 'paid' || order.status === 'delivered')
                            ? 'admin-status-select--green'
                            : order.status === 'unpaid'
                            ? 'admin-status-select--red'
                            : 'admin-status-select--yellow'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: '#718096' }}>
                      {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="admin-new-btn admin-new-btn--danger admin-new-btn--sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        style={{ padding: '6px 10px', borderRadius: '8px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-mobile-only admin-order-cards">
            {orders.map((order) => (
              <div key={order.id} className="admin-order-card">
                <div className="admin-order-card__header">
                  <div>
                    <strong className="admin-order-card__id">#{order.id.slice(-6).toUpperCase()}</strong>
                    <span className="admin-order-card__date">
                      {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '—'}
                    </span>
                  </div>
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`admin-status-select ${
                      (order.status === 'paid' || order.status === 'delivered')
                        ? 'admin-status-select--green'
                        : order.status === 'unpaid'
                        ? 'admin-status-select--red'
                        : 'admin-status-select--yellow'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="admin-order-card__body">
                  <div className="admin-order-card__section">
                    <span className="admin-order-card__label">Customer</span>
                    <strong className="admin-order-card__val">{order.name || order.customerName || '—'}</strong>
                    <span className="admin-order-card__subval">{order.email || '—'} &bull; {order.city || '—'}</span>
                  </div>
                  
                  <div className="admin-order-card__section" style={{ marginTop: '10px' }}>
                    <span className="admin-order-card__label">Items</span>
                    <span className="admin-order-card__items-text">
                      {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(', ') || '—'}
                    </span>
                  </div>
                </div>

                <div className="admin-order-card__divider"></div>

                <div className="admin-order-card__footer">
                  <span className="admin-order-card__total-label">Total Amount</span>
                  <strong className="admin-order-card__total-val">₹{order.total?.toLocaleString() || '—'}</strong>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-new-btn admin-new-btn--danger admin-new-btn--sm"
                    onClick={() => handleDeleteOrder(order.id)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="admin-new-shell">
      {/* Redesigned Top Header */}
      <header className="admin-new-header">
        <div className="admin-new-header-container">
          <div className="admin-new-header-left">
            <Link to="/" className="admin-new-back-btn" title="Back to Website">
              <ArrowLeft size={18} />
            </Link>
            <div className="admin-new-divider"></div>
            <div className="admin-new-brand">
              <img src="/images/protect-logo.png" alt="Protect Logo" className="admin-new-logo-img" />
              <span className="admin-new-logo-badge">Admin Suite</span>
            </div>
          </div>
          <div className="admin-new-header-right">
            <div className="admin-new-profile">
              <div className="admin-new-profile-avatar">
                {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="admin-new-profile-info">
                <span className="admin-new-profile-name">{user.email}</span>
                <span className="admin-new-profile-role">Administrator</span>
              </div>
            </div>
            <button className="admin-new-logout-btn" onClick={handleSignOut} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Redesigned Tab Navigation Bar */}
      <div style={{ background: '#061C14', paddingBottom: '16px', paddingTop: '4px' }}>
        <div className="admin-new-tabs-container">
          <div className="admin-new-tabs">
            {NAV_TABS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={`admin-new-tab ${isActive ? 'admin-new-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Redesigned Canvas and Content Area */}
      <main className="admin-new-main">
        <div className="admin-new-main-container">
          <div className="admin-new-section-header">
            <h1 className="admin-new-section-title">
              {NAV_TABS.find((t) => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="admin-new-section-subtitle">
              {activeTab === 'analytics' && 'Real-time sales tracking, visitor stats, and catalog performance metrics.'}
              {activeTab === 'products' && 'Create, edit, and organize Protect catalog items and inventory details.'}
              {activeTab === 'orders' && 'Track and verify customer purchases, delivery status, and order details.'}
              {activeTab === 'coupons' && 'Create and manage promotional discounts, customer codes, and special pricing.'}
              {activeTab === 'reviews' && 'Moderate customer testimonials, star ratings, and product feedback.'}
              {activeTab === 'blogs' && 'Write, edit, and publish health, lifestyle, and product knowledge articles.'}
              {activeTab === 'team' && 'Manage administrative permissions, invite dashboard editors, and inspect accounts.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'products' && <ProductManager />}
              {activeTab === 'coupons' && <CouponManager />}
              {activeTab === 'reviews' && <ReviewManager />}
              {activeTab === 'blogs' && <BlogManager />}
              {activeTab === 'team' && <TeamManager />}
              {activeTab === 'orders' && renderOrdersTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}