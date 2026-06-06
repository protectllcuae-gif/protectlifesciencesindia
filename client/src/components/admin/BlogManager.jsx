import React, { useState, useEffect } from 'react'
import { Plus, Trash, BookOpen } from 'lucide-react'

export default function BlogManager() {
  const [blogs, setBlogs] = useState(() => {
    const local = localStorage.getItem('pls_blogs')
    return local ? JSON.parse(local) : [
      { id: '1', title: 'Why Gummy Vitamins Are the Future of Nutrition', author: 'Dr. Sarah Al-Mansoori', date: 'June 1, 2026', readTime: '5 min read' },
      { id: '2', title: 'The Science Behind Hair, Skin & Nails Gummies', author: 'Rohan Gupta (Lead Formulator)', date: 'May 20, 2026', readTime: '4 min read' }
    ]
  })

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    localStorage.setItem('pls_blogs', JSON.stringify(blogs))
  }, [blogs])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!title || !author) return
    const newBlog = {
      id: Date.now().toString(),
      title,
      author,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: '3 min read'
    }
    setBlogs([newBlog, ...blogs])
    setTitle('')
    setAuthor('')
    setContent('')
  }

  const handleDelete = (id) => {
    setBlogs(blogs.filter(b => b.id !== id))
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Stories & Insights Blog</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '25px' }}>
        Publish scientific articles, formulation announcements, and health updates.
      </p>

      <div className="admin-form-grid-2">
        <div>
          <form className="admin-form" onSubmit={handleCreate}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#e8c872' }}>Draft New Article</h3>
            
            <label>
              Article Title *
              <input 
                type="text" 
                placeholder="e.g. How Vit D3 Gummies boost daily immunity" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </label>

            <label>
              Author Name / Designation *
              <input 
                type="text" 
                placeholder="e.g. Dr. Sarah Al-Mansoori" 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
              />
            </label>

            <label>
              Content Text
              <textarea 
                placeholder="Write the full scientific insights or news update..." 
                value={content} 
                onChange={e => setContent(e.target.value)}
              />
            </label>

            <button type="submit" className="admin-btn admin-btn--gold" style={{ marginTop: '8px' }}>
              <Plus size={16} /> Publish Article
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e6edf3' }}>Published Articles</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <BookOpen size={18} style={{ color: '#e8c872', marginTop: '3px', flexShrink: 0 }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#e6edf3', marginBottom: '4px', whiteSpace: 'normal' }}>
                            {b.title}
                          </strong>
                          <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                            By {b.author} &bull; {b.date} &bull; {b.readTime}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => handleDelete(b.id)}
                        title="Delete Article"
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '24px' }}>
                      No articles published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}