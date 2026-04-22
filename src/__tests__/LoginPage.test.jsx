import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LoginPage from '../components/auth/LoginPage'

const mockLogin = vi.fn()
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

test('renders sign in button', () => {
  render(<LoginPage />)
  expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
})
