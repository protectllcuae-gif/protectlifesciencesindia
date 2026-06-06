import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, enquiries: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersSnap, productsSnap, enquiriesSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'enquiries')),
        ])
        const orderDocs = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const revenue = orderDocs.reduce((sum, o) => sum + (o.status === 'paid' ? (o.total || o.totalAmount || 0) : 0), 0)
        setStats({
          orders: orderDocs.length,
          revenue,
          products: productsSnap.size,
          enquiries: enquiriesSnap.size,
        })
        setRecentOrders(orderDocs.slice(0, 8))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Orders',    value: stats.orders,                        change: '+12% this month', positive: true  },
    { label: 'Total Revenue',   value: `₹${stats.revenue.toLocaleString()}`, change: '+18% this month', positive: true  },
    { label: 'Products Listed', value: stats.products,                      change: 'In catalog',      positive: true  },
    { label: 'Enquiries',       value: stats.enquiries,                     change: 'New leads',       positive: true  },
  ]

  return (
    <div>
      <div className="admin-main__header">
        <div>
          <h1 className="admin-main__title">Analytics</h1>
          <p className="admin-main__subtitle">Business intelligence overview</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {statCards.map((card) => (
              <div key={card.label} className="admin-stat-card">
                <div className="admin-stat-card__label">{card.label}</div>
                <div className="admin-stat-card__value">{card.value}</div>
                <div className={`admin-stat-card__change ${card.positive ? 'positive' : 'negative'}`}>
                  {card.change}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-panel">
            <h2 className="admin-panel__title">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '32px 0' }}>No orders yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong style={{ color: '#e8c872' }}>#{order.id.slice(-6).toUpperCase()}</strong></td>
                        <td>
                          <div style={{ color: '#e6edf3', fontSize: '13px' }}>{order.name || order.customerName || '—'}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{order.email || ''}</div>
                        </td>
                        <td><strong style={{ color: '#e6edf3' }}>₹{(order.total || order.totalAmount || 0).toLocaleString()}</strong></td>
                        <td style={{ color: 'rgba(255,255,255,0.6)' }}>{order.city || '—'}</td>
                        <td>
                          <span className={`admin-badge ${order.status === 'paid' ? 'admin-badge--green' : order.status === 'unpaid' ? 'admin-badge--red' : 'admin-badge--yellow'}`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                          {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}