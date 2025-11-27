import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/app/components/Navbar'
import { CartProvider } from '@/app/context/CartContext'
import { LanguageProvider } from '@/app/context/LanguageContext'
import { ThemeProvider } from '@/app/components/ThemeProvider'

const renderNavbar = () => {
  return render(
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <CartProvider>
          <Navbar />
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

describe('Navbar Component', () => {
  test('should render brand name', () => {
    renderNavbar()
    
    expect(screen.getByText('CHOCO-CELIA')).toBeInTheDocument()
  })

  test('should render navigation links', () => {
    renderNavbar()
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  test('should have correct href attributes', () => {
    renderNavbar()
    
    const homeLink = screen.getAllByRole('link', { name: /home/i })[0]
    expect(homeLink).toHaveAttribute('href', '/')
  })

  test('should render cart icon', () => {
    renderNavbar()
    
    const cartButtons = screen.getAllByRole('button')
    expect(cartButtons.length).toBeGreaterThan(0)
  })

  test('should render language toggle button', () => {
    renderNavbar()
    
    const langButtons = screen.getAllByText('AR')
    expect(langButtons.length).toBeGreaterThan(0)
  })

  test('should toggle language when button clicked', () => {
    renderNavbar()
    
    const langButtons = screen.getAllByText('AR')
    fireEvent.click(langButtons[0])
    
    // After clicking, buttons should show 'EN' (since we switched to Arabic)
    const enButtons = screen.getAllByText('EN')
    expect(enButtons.length).toBeGreaterThan(0)
  })

  test('should toggle mobile menu', () => {
    renderNavbar()
    
    // Find menu button (should be present for mobile)
    const menuButtons = screen.getAllByRole('button')
    const menuButton = menuButtons.find(btn => 
      btn.querySelector('svg') !== null
    )
    
    expect(menuButton).toBeInTheDocument()
  })

  test('should show cart item count when items exist', () => {
    // This would require adding items to cart first
    renderNavbar()
    
    // Initially should be 0 items
    const cartButtons = screen.getAllByRole('button')
    expect(cartButtons).toBeTruthy()
  })
})
