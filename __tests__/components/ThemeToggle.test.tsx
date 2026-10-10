import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { ThemeToggle } from '@/app/components/ThemeToggle'

const mockSetTheme = jest.fn()
const mockUseTheme = jest.fn()
jest.mock('next-themes', () => ({ useTheme: () => mockUseTheme() }))
beforeEach(() => { mockSetTheme.mockClear(); mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme }) })

test('switches from the resolved light theme to dark', () => {
  render(<ThemeToggle />)
  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
  expect(mockSetTheme).toHaveBeenCalledWith('dark')
})
test('switches a dark system theme to an explicit light theme in Arabic', () => {
  mockUseTheme.mockReturnValue({ theme: 'system', resolvedTheme: 'dark', setTheme: mockSetTheme })
  render(<ThemeToggle locale="ar" />)
  const button = screen.getByRole('button', { name: 'تفعيل الوضع الفاتح' })
  expect(button).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(button)
  expect(mockSetTheme).toHaveBeenCalledWith('light')
})
test('waits for theme hydration before accepting input', () => {
  mockUseTheme.mockReturnValue({ resolvedTheme: undefined, setTheme: mockSetTheme })
  render(<ThemeToggle />)
  expect(screen.getByRole('button')).toBeDisabled()
})


test('enables the server-rendered toggle after hydration', async () => {
  const container = document.createElement('div')
  container.innerHTML = renderToString(<ThemeToggle />)
  document.body.appendChild(container)
  expect(container.querySelector('button')).toBeDisabled()
  let root: Root | undefined
  await act(async () => { root = hydrateRoot(container, <ThemeToggle />) })
  expect(container.querySelector('button')).not.toBeDisabled()
  fireEvent.click(container.querySelector('button')!)
  expect(mockSetTheme).toHaveBeenCalledWith('dark')
  await act(async () => root?.unmount())
  container.remove()
})
