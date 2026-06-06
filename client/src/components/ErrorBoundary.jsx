import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderRadius: '16px', background: 'white', padding: '40px', border: '1px solid #e2e8f0' }}>
            <img src="/images/protect-logo.png" alt="Protect Life Sciences" style={{ width: '120px', margin: '0 auto 20px', display: 'block' }} />
            <h1 style={{ color: '#1A365D', fontSize: '24px', marginBottom: '16px' }}>An error has occurred</h1>
            <p style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              We apologize for the inconvenience. The application encountered an unexpected runtime exception.
            </p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              style={{ padding: '12px 24px', fontSize: '14px', background: '#C9A84C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Return to Homepage
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
