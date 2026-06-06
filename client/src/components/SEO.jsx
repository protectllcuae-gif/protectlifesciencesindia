import { useEffect } from 'react'

export default function SEO({ title, description, keywords, canonical }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | Protect Life Sciences`
    } else {
      document.title = 'Protect Life Sciences | Premium Scientific Nutraceutical Gummies'
    }

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description || 'Premium scientific nutraceutical gummies backed by scientific research, crafted for taste and health. Browse our catalog for wellness.')

    // 3. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', keywords || 'nutraceutical, gummies, vitamin c, garcinia cambogia, health gummies, stamina gummies, melatonin sleep')

    // 4. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', canonical || window.location.href)

  }, [title, description, keywords, canonical])

  return null
}
