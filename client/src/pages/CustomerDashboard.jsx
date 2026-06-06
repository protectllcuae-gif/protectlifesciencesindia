import React, { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

export default function CustomerDashboard() {
  const { currentUser } = useOutletContext() || {}
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) { setLoading(false); return }
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        )
        const snap = await getDocs(q)
        const userOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        userOrders.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0
          const tB = b.createdAt?.seconds || 0
          return tB - tA
        })
        setOrders(userOrders)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [currentUser])

  if (!currentUser) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-card">
          <h1>My Account</h1>
          <p>Please <Link to="/login">log in</Link> to view your dashboard.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-card">
        <Link className="pg-back-link" to="/" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: 600 }}>← Back to home</Link>
        <div className="dashboard-welcome">
          <div className="dashboard-avatar">{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</div>
          <div>
            <h1>Welcome back{currentUser.displayName ? `, ${currentUser.displayName}` : ''}!</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>My Orders</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="dashboard-empty">
              <p>No orders yet.</p>
              <Link to="/shop" className="btn btn-gold">Start Shopping</Link>
            </div>
          ) : (
            <div className="dashboard-orders">
              {orders.map((order) => (
                <div key={order.id} className="dashboard-order-item">
                  <div className="dashboard-order-info">
                    <h3 className="dashboard-order-id">Order #{order.id.slice(-6).toUpperCase()}</h3>
                    <p className="dashboard-order-date">{order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'Recent'}</p>
                  </div>
                  <div className="dashboard-order-items">
                    {order.items?.map((item) => (
                      <span key={item.slug} className="dashboard-order-badge">{item.name} &times; {item.quantity}</span>
                    ))}
                  </div>
                  <div className="dashboard-order-total">
                    <strong>&#8377;{order.total?.toLocaleString()}</strong>
                    <span className={`dashboard-order-status status-${order.status}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="dashboard-actions">
            <Link to="/shop" className="btn btn-outline-dark">Browse Products</Link>
            <Link to="/cart" className="btn btn-outline-dark">View Cart</Link>
            <Link to="/contact" className="btn btn-outline-dark">Contact Support</Link>
          </div>
        </div>
      </div>
    </section>
  )
}