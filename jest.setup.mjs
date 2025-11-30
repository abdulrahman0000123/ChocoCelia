import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: new Proxy({}, {
      get: (_, prop) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          // Filter out framer-motion specific props
          const { 
            initial, animate, exit, variants, transition, 
            whileHover, whileTap, whileFocus, whileInView,
            viewport, drag, dragConstraints, dragElastic,
            layoutId, layout, onAnimationStart, onAnimationComplete,
            ...filteredProps 
          } = props
          return React.createElement(prop, { ...filteredProps, ref }, children)
        })
      }
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
    useAnimation: () => ({
      start: jest.fn(),
      set: jest.fn(),
      stop: jest.fn(),
    }),
    useInView: () => true,
  }
})

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
    themes: ['light', 'dark'],
  }),
}))

// Only mock window in jsdom environment
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value.toString() }),
      removeItem: jest.fn(key => { delete store[key] }),
      clear: jest.fn(() => { store = {} }),
    }
  })()
  global.localStorage = localStorageMock
}
