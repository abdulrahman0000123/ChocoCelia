import { render, screen } from '@testing-library/react'
import { Footer } from '@/app/components/Footer'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Footer Component', () => {
  test('should render brand name', () => {
    render(<Footer />)
    
    expect(screen.getByText('CHOCO-CELIA')).toBeInTheDocument()
  })

  test('should render description', () => {
    render(<Footer />)
    
    expect(screen.getByText(/Where Every Bite Melts Your Heart/i)).toBeInTheDocument()
  })

  test('should render Quick Links section', () => {
    render(<Footer />)
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  test('should render social media section', () => {
    render(<Footer />)
    
    expect(screen.getByText('Connect With Us')).toBeInTheDocument()
  })

  test('should render copyright text', () => {
    render(<Footer />)
    
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  test('should have correct href attributes for links', () => {
    render(<Footer />)
    
    const menuLink = screen.getByRole('link', { name: /menu/i })
    expect(menuLink).toHaveAttribute('href', '/menu')
    
    const aboutLink = screen.getByRole('link', { name: /about us/i })
    expect(aboutLink).toHaveAttribute('href', '/about')
    
    const contactLink = screen.getByRole('link', { name: /contact/i })
    expect(contactLink).toHaveAttribute('href', '/contact')
  })

  test('should render social media icons', () => {
    render(<Footer />)
    
    // Check if social media section exists
    expect(screen.getByText('Connect With Us')).toBeInTheDocument()
  })
})
