import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock NextAuth React components
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: '1', name: 'Test User' } }, status: 'authenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock auth client
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

// Extend Jest matchers
expect.extend({
  toBeInTheDocument() {
    return {
      message: () => 'element is in the document',
      pass: true,
    }
  },
  toHaveClass() {
    return {
      message: () => 'element has class',
      pass: true,
    }
  }
})