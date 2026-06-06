import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { auth } from './firebase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      if (user) {
        setUserRole(localStorage.getItem('userRole') || 'customer')
      } else {
        setUserRole(null)
        localStorage.removeItem('userRole')
      }
    })
    return () => unsubscribe()
  }, [])

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pls_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('pls_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.slug === product.slug)
      if (existing) {
        return prev.map((item) =>
          item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (slug) => {
    setCart((prev) => prev.filter((item) => item.slug !== slug))
  }

  const updateQuantity = (slug, quantity) => {
    if (quantity <= 0) {
      removeFromCart(slug)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const isAdminPage = location.pathname.toLowerCase().includes('admin')

  return (
    <div className={`app-shell ${isHomePage ? 'home-page' : ''} ${isAdminPage ? 'admin-page-shell' : ''}`}>
      {/* Premium Header Component */}
      {!isAdminPage && <Navbar cart={cart} currentUser={currentUser} userRole={userRole} />}

      {/* Page Content */}
      <main className="page-content">
        <Outlet context={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, currentUser, userRole }} />
      </main>

      {/* Footer */}
      {!isAdminPage && <Footer />}

      {/* Floating WhatsApp Button */}
      {!isAdminPage && (
        <a
          href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '917385060011').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float-btn"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M19.005 4.908A9.836 9.836 0 0 0 11.97 2c-5.462 0-9.91 4.454-9.913 9.925a9.897 9.897 0 0 0 1.512 5.234L2 22l5.008-1.312a9.897 9.897 0 0 0 4.96 1.332h.004c5.46 0 9.908-4.45 9.913-9.92a9.85 9.85 0 0 0-2.88-7.192zm-7.035 15.08h-.003a8.184 8.184 0 0 1-4.175-1.14l-.3-.178-3.1 1.01L5.4 16.633l-.196-.312a8.204 8.204 0 0 1-1.258-4.39c0-4.52 3.678-8.2 8.2-8.2a8.16 8.16 0 0 1 5.8 2.404 8.16 8.16 0 0 1 2.396 5.808c-.004 4.524-3.682 8.204-8.222 8.204zm4.512-6.162c-.247-.124-1.464-.722-1.692-.806-.228-.084-.393-.124-.558.124-.166.248-.641.806-.786.972-.145.165-.29.185-.538.062a6.772 6.772 0 0 1-1.996-1.23 7.464 7.464 0 0 1-1.38-1.716c-.145-.247-.015-.38.11-.504.112-.11.247-.29.372-.434.124-.145.165-.248.248-.414.083-.165.042-.31-.02-.434-.063-.124-.559-1.348-.765-1.844-.2-.487-.403-.42-.558-.428-.145-.008-.31-.008-.476-.008a.916.916 0 0 0-.662.31c-.228.248-.87.847-.87 2.066 0 1.22.888 2.397.988 2.532.1.137 1.747 2.67 4.233 3.743.59.255 1.053.408 1.41.52.593.189 1.133.162 1.56.098.476-.07 1.464-.598 1.67-.178.207-.42.207-.782.145-.847a.352.352 0 0 0-.248-.124z"/>
          </svg>
        </a>
      )}
    </div>
  )
}