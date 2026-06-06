import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { vi } from 'vitest'

vi.mock('../firebase', () => ({
  auth: { currentUser: null, onAuthStateChanged: vi.fn(() => () => {}) },
  signInWithGoogle: vi.fn(),
  signOutGoogle: vi.fn(),
}))

describe('App shell', () => {
  it('renders navigation links for the main site', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Verify presence of Shop links (Navbar & Footer)
    const shopLinks = screen.getAllByRole('link', { name: /Shop/i })
    expect(shopLinks.length).toBeGreaterThan(0)
    expect(shopLinks[0]).toBeInTheDocument()

    // Verify footer links
    expect(screen.getByRole('link', { name: /About Us/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /My Account/i })).toBeInTheDocument()
  })
})
