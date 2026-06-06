import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Admin from '../pages/Admin'
import { vi } from 'vitest'

vi.mock('../firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback(null)
      return () => {}
    }),
  },
  signInWithGoogle: vi.fn(),
  signOutGoogle: vi.fn(),
  isAdminUser: vi.fn().mockResolvedValue(false),
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
}))

describe('Admin page', () => {
  it('prompts for sign in when not authenticated', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByText(/Please log in with your admin account/i)).toBeInTheDocument())
  })
})
