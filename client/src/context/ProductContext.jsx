import React, { createContext, useContext, useEffect, useState } from 'react'
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { seedProducts } from '../products-catalog'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      try {
        const CACHE_KEY = 'pls_products_cache'
        const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
        const cachedDataStr = localStorage.getItem(CACHE_KEY)

        // 1. Check if cache exists
        if (cachedDataStr) {
          try {
            const cached = JSON.parse(cachedDataStr)
            
            // If cache timestamp is within 10 minutes, use cached products directly (0 reads!)
            if (cached.products && cached.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
              setProducts(cached.products)
              const cats = Array.from(new Set(cached.products.map((p) => p.category).filter(Boolean)))
              setCategories(['All', ...cats])
              setLoading(false)
              return
            }

            // If cache expired, check if catalog metadata has changed (1 read)
            const metaDoc = await getDoc(doc(db, 'metadata', 'catalog'))
            if (metaDoc.exists()) {
              const { lastUpdated } = metaDoc.data()
              // If catalog hasn't changed since cache was saved, extend cache duration (1 read instead of full list fetch!)
              if (lastUpdated && cached.lastUpdated === lastUpdated) {
                setProducts(cached.products)
                const cats = Array.from(new Set(cached.products.map((p) => p.category).filter(Boolean)))
                setCategories(['All', ...cats])
                
                // Save cache with refreshed timestamp
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                  ...cached,
                  timestamp: Date.now()
                }))
                setLoading(false)
                return
              }
            }
          } catch (e) {
            console.warn('Failed to parse or verify products cache:', e)
          }
        }

        // 2. Fetch fresh catalog from Firestore
        const metaDoc = await getDoc(doc(db, 'metadata', 'catalog'))
        let currentLastUpdated = Date.now()
        if (metaDoc.exists()) {
          currentLastUpdated = metaDoc.data().lastUpdated || currentLastUpdated
        } else {
          // If metadata doc doesn't exist, create it
          await setDoc(doc(db, 'metadata', 'catalog'), { lastUpdated: currentLastUpdated })
        }

        const snapshot = await getDocs(collection(db, 'products'))
        if (cancelled) return
        let docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        
        if (docs.length === 0) {
          // Seed default products to Firestore if database is empty
          const seedPromises = seedProducts.map(async (p) => {
            const docRef = doc(db, 'products', p.slug)
            await setDoc(docRef, p)
            return { id: p.slug, ...p }
          })
          docs = await Promise.all(seedPromises)
        }

        setProducts(docs)
        const cats = Array.from(new Set(docs.map((p) => p.category).filter(Boolean)))
        setCategories(['All', ...cats])

        // Cache the fresh catalog
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          products: docs,
          timestamp: Date.now(),
          lastUpdated: currentLastUpdated
        }))
      } catch (err) {
        if (!cancelled) {
          console.error('Product fetch failed:', err)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [])

  return (
    <ProductContext.Provider value={{ products, categories, loading, error }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider')
  return ctx
}