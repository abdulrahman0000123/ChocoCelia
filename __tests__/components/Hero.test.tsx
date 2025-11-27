import { render, screen } from '@testing-library/react'
import { Hero } from '@/app/components/Hero'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Hero Component', () => {
  test('should render main heading', () => {
    render(<Hero />)
    
    expect(screen.getByText(/Where Every Bite/i)).toBeInTheDocument()
    expect(screen.getByText(/Melts Your Heart/i)).toBeInTheDocument()
  })

  test('should render subtitle', () => {
    render(<Hero />)
    
    expect(screen.getByText(/Experience the finest handmade chocolates/i)).toBeInTheDocument()
  })

  test('should render Explore Menu button', () => {
    render(<Hero />)
    
    const exploreButton = screen.getByText('Explore Menu')
    expect(exploreButton).toBeInTheDocument()
    expect(exploreButton.closest('a')).toHaveAttribute('href', '/menu')
  })

  test('should render Our Story button', () => {
    render(<Hero />)
    
    const storyButton = screen.getByText('Our Story')
    expect(storyButton).toBeInTheDocument()
    expect(storyButton.closest('a')).toHaveAttribute('href', '/about')
  })

  test('should have gradient background section', () => {
    const { container } = render(<Hero />)
    
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  test('should render both CTA buttons', () => {
    render(<Hero />)
    
    const buttons = screen.getAllByRole('link')
    expect(buttons).toHaveLength(2)
  })
})
