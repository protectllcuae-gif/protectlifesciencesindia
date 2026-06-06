import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Home from '../pages/Home'

vi.mock('../context/ProductContext', () => ({
  useProducts: () => ({
    products: [
      { id: '1', name: 'Kids Multivitamin', price: 999, slug: 'kids-multivitamin', category: 'Kids', is_featured: true, image_url: '' }
    ],
    categories: ['All', 'Kids'],
    loading: false,
  }),
  ProductProvider: ({ children }) => <div>{children}</div>
}))

describe('Home page', () => {
  it('renders the hero heading and explore products button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    // Heading in Home.jsx: "Protecting Wellness Through Quality Gummies"
    expect(screen.getByRole('heading', { name: /Protecting Wellness/i })).toBeInTheDocument()
    // Button link in Home.jsx: "Explore Products"
    expect(screen.getByRole('link', { name: /Explore Products/i })).toBeInTheDocument()
  })
})
