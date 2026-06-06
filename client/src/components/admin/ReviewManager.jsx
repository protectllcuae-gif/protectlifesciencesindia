import React, { useState, useEffect } from 'react'
import { Star, Check, Trash } from 'lucide-react'

export default function ReviewManager() {
  const [reviews, setReviews] = useState(() => {
    const local = localStorage.getItem('pls_reviews')
    return local ? JSON.parse(local) : [
      { id: '1', author: 'Aman Sharma', rating: 5, comment: 'Best gummies I have ever purchased. Truly premium quality!', approved: true },
      { id: '2', author: 'Priya Patel', rating: 4, comment: 'Biotin gummies taste amazing. Seeing results in my hair texture.', approved: true },
      { id: '3', author: 'Rahul Mehta', rating: 5, comment: 'UAE imported formulations. Very good delivery speed.', approved: false }
    ]
  })

  useEffect(() => {
    localStorage.setItem('pls_reviews', JSON.stringify(reviews))
  }, [reviews])

  const handleApprove = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, approved: true } : r))
  }

  const handleDelete = (id) => {
    setReviews(reviews.filter(r => r.id !== id))
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Product Reviews & Testimonials</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px' }}>
        Moderate customer feedback before publishing to product details pages.
      </p>

          {/* Desktop Table View */}
          <div className="admin-table-wrap admin-desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: '600' }}>{r.author}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', color: '#e8c872' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r.rating ? '#e8c872' : 'none'}
                            stroke="#e8c872"
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.comment}
                    </td>
                    <td>
                      <span className={`admin-badge ${r.approved ? 'admin-badge--green' : 'admin-badge--yellow'}`}>
                        {r.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!r.approved && (
                          <button
                            className="admin-btn admin-btn--gold admin-btn--sm"
                            onClick={() => handleApprove(r.id)}
                            title="Approve Review"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        <button
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => handleDelete(r.id)}
                          title="Delete Review"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                      No reviews available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-mobile-only admin-review-cards">
            {reviews.map((r) => (
              <div key={r.id} className="admin-review-card">
                <div className="admin-review-card__header">
                  <div>
                    <strong className="admin-review-card__author">{r.author}</strong>
                    <div style={{ display: 'flex', gap: '2px', color: '#e8c872', marginTop: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < r.rating ? '#e8c872' : 'none'}
                          stroke="#e8c872"
                        />
                      ))}
                    </div>
                  </div>
                  <span className={`admin-badge ${r.approved ? 'admin-badge--green' : 'admin-badge--yellow'}`}>
                    {r.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="admin-review-card__comment">
                  {r.comment}
                </div>

                <div className="admin-review-card__divider"></div>

                <div className="admin-review-card__actions">
                  {!r.approved && (
                    <button
                      className="admin-btn admin-btn--gold admin-btn--sm"
                      onClick={() => handleApprove(r.id)}
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  <button
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
                No reviews available.
              </div>
            )}
          </div>
    </div>
  )
}