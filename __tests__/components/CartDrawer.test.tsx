import { render, screen, fireEvent } from '@testing-library/react'
import { CartDrawer } from '@/app/components/CartDrawer'
import { CartProvider, useCart } from '@/app/context/CartContext'

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => require('../../messages/en.json')[key] || key,
}))
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}))
function Controls() {
  const { toggleCart, addItem } = useCart()
  return <><button onClick={toggleCart}>Open cart</button><button onClick={() => addItem({ id: 'one', name: 'Chocolate box', price: 25, image: '', quantity: 1 })}>Add box</button></>
}
const renderCart = () => render(<CartProvider><Controls /><CartDrawer /></CartProvider>)
beforeEach(() => localStorage.clear())
test('cart opens and closes with Escape', () => {
  renderCart()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Open cart'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
test('compact cart preserves quantity controls and checkout destination', () => {
  renderCart()
  fireEvent.click(screen.getByText('Add box'))
  fireEvent.click(screen.getByText('Open cart'))
  expect(screen.getByText('Chocolate box')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /increase/i }))
  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /checkout/i })).toHaveAttribute('href', '/checkout')
})
