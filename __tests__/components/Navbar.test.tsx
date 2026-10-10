import { render, screen, fireEvent, within } from '@testing-library/react'
import { Navbar } from '@/app/components/Navbar'
import mockMessages from '../../messages/en.json'

const mockReplace = jest.fn()
const mockToggleCart = jest.fn()
let mockLocale = 'en'
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string) => mockMessages[key as keyof typeof mockMessages] || key,
}))
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
  usePathname: () => '/menu',
  useRouter: () => ({ replace: mockReplace }),
}))
jest.mock('@/app/context/CartContext', () => ({ useCart: () => ({ toggleCart: mockToggleCart, items: [{ quantity: 2 }] }) }))
jest.mock('@/app/hooks/useWishlist', () => ({ useWishlist: () => ({ wishlist: [] }) }))
jest.mock('@/app/components/SearchBar', () => ({ SearchBar: () => <div role="dialog" aria-label="Search products" /> }))

beforeEach(() => { jest.clearAllMocks(); mockLocale = 'en' })

test('mobile navigation exposes shopping destinations and the active page', () => {
  render(<Navbar />)
  expect(screen.getByText('Choco Celia')).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: 'Main navigation' })
  expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/menu')
  expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('aria-current', 'page')
  expect(within(nav).getByRole('link', { name: /wishlist/i })).toHaveAttribute('href', '/wishlist')
})
test.each(['en', 'ar'])('mobile header switches from %s on the current route and closes More', (locale) => {
  mockLocale = locale
  render(<Navbar />)
  const language = screen.getByRole('button', { name: locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية' })
  expect(language.closest('nav')).toBeInTheDocument()
  expect(language.nextElementSibling).toHaveAttribute('aria-pressed')
  expect(language).toHaveTextContent(locale === 'ar' ? 'EN' : 'عربي')
  const more = screen.getByRole('button', { name: locale === 'ar' ? 'المزيد' : 'More' })
  fireEvent.click(more)
  expect(more).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(screen.getByRole('button', { name: locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية' }))
  expect(mockReplace).toHaveBeenCalledWith('/menu', { locale: locale === 'ar' ? 'en' : 'ar' })
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
