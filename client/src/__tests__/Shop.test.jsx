import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Shop from '../pages/Shop'

vi.mock('../context/ProductContext', () => ({
  useProducts: () => ({
    products: [
      {
        id: 'gummy-1',
        name: 'Immune Gummies',
        price: 49,
        slug: 'immune-gummies',
        image_url: 'https://example.com/image.png',
        short_description: 'Daily immune support gummy.',
        category: 'Wellness',
      },
    ],
    categories: ['All', 'Wellness'],
    loading: false,
  }),
  ProductProvider: ({ children }) => <div>{children}</div>
}))

describe('Shop page', () => {
  it('renders product cards when products exist', async () => {
    render(
      <BrowserRouter>
        <Shop />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByRole('link', { name: /Immune Gummies/i })).toBeInTheDocument())
    expect(screen.getByRole('img', { name: /Immune Gummies/i })).toBeInTheDocument()
    expect(screen.getByText(/INR 49/i)).toBeInTheDocument()
  })
})
