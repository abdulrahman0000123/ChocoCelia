import { render, screen, fireEvent, within } from '@testing-library/react'
import { Navbar } from '@/app/components/Navbar'

const mockReplace = jest.fn()
const mockToggleCart = jest.fn()
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => require('../../messages/en.json')[key] || key,
}))
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
  usePathname: () => '/menu',
  useRouter: () => ({ replace: mockReplace }),
}))
jest.mock('@/app/context/CartContext', () => ({ useCart: () => ({ toggleCart: mockToggleCart, items: [{ quantity: 2 }] }) }))
jest.mock('@/app/hooks/useWishlist', () => ({ useWishlist: () => ({ wishlist: [] }) }))
jest.mock('@/app/components/SearchBar', () => ({ SearchBar: () => <div role="dialog" aria-label="Search products" /> }))

beforeEach(() => jest.clearAllMocks())

test('mobile navigation exposes shopping destinations and the active page', () => {
  render(<Navbar />)
  expect(screen.getByText('Choco Celia')).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: 'Main navigation' })
  expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/menu')
  expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('aria-current', 'page')
  expect(within(nav).getByRole('link', { name: /wishlist/i })).toHaveAttribute('href', '/wishlist')
})
test('More opens secondary navigation and language switching preserves the current route', () => {
  render(<Navbar />)
  const more = screen.getByRole('button', { name: 'More' })
  fireEvent.click(more)
  expect(more).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(screen.getByRole('button', { name: /Language/ }))
  expect(mockReplace).toHaveBeenCalledWith('/menu', { locale: 'ar' })
  expect(more).toHaveAttribute('aria-expanded', 'false')
})
test('bottom cart opens the existing cart and the header search opens search', () => {
  render(<Navbar />)
  const nav = screen.getByRole('navigation', { name: 'Main navigation' })
  fireEvent.click(within(nav).getByRole('button', { name: /Cart/ }))
  expect(mockToggleCart).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getAllByRole('button', { name: /Search/ })[0])
  expect(screen.getByRole('dialog', { name: 'Search products' })).toBeInTheDocument()
})
