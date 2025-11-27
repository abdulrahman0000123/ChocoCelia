import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/app/components/ProductCard'
import { CartProvider } from '@/app/context/CartContext'

const mockProduct = {
  id: '1',
  name: 'Dark Truffle Delight',
  description: 'Rich dark chocolate with smooth truffle center',
  price: 24.99,
  image: '/test.jpg',
  category: 'Dark',
  tags: 'Best Seller'
}

const renderWithCart = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>)
}

describe('ProductCard Component', () => {
  test('should render product information', () => {
    renderWithCart(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Dark Truffle Delight')).toBeInTheDocument()
    expect(screen.getByText('Rich dark chocolate with smooth truffle center')).toBeInTheDocument()
    expect(screen.getByText('24.99 EGP')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  test('should display tag when provided', () => {
    renderWithCart(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Best Seller')).toBeInTheDocument()
  })

  test('should not display tag when not provided', () => {
    const productNoTag = { ...mockProduct, tags: undefined }
    renderWithCart(<ProductCard product={productNoTag} />)
    
    expect(screen.queryByText('Best Seller')).not.toBeInTheDocument()
  })

  test('should have link to product detail page', () => {
    renderWithCart(<ProductCard product={mockProduct} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/menu/1')
  })

  test('should show add to cart button on hover', () => {
    renderWithCart(<ProductCard product={mockProduct} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  test('should format price correctly', () => {
    const productWithDecimal = { ...mockProduct, price: 25.5 }
    renderWithCart(<ProductCard product={productWithDecimal} />)
    
    expect(screen.getByText('25.50 EGP')).toBeInTheDocument()
  })
})
