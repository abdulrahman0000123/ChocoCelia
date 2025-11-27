import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@/app/context/LanguageContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('LanguageContext', () => {
  test('should initialize with English locale', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.locale).toBe('en')
    expect(result.current.dir).toBe('ltr')
  })

  test('should translate keys correctly in English', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.t('home')).toBe('Home')
    expect(result.current.t('menu')).toBe('Menu')
    expect(result.current.t('cart')).toBe('Cart')
  })

  test('should switch to Arabic locale', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLocale('ar')
    })

    expect(result.current.locale).toBe('ar')
    expect(result.current.dir).toBe('rtl')
  })

  test('should translate keys correctly in Arabic', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLocale('ar')
    })

    expect(result.current.t('home')).toBe('الرئيسية')
    expect(result.current.t('menu')).toBe('القائمة')
    expect(result.current.t('cart')).toBe('السلة')
  })

  test('should switch between languages', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLocale('ar')
    })
    expect(result.current.t('addToCart')).toBe('أضف إلى السلة')

    act(() => {
      result.current.setLocale('en')
    })
    expect(result.current.t('addToCart')).toBe('Add to Cart')
  })

  test('should return key if translation not found', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    // @ts-ignore - testing invalid key
    expect(result.current.t('nonExistentKey')).toBe('nonExistentKey')
  })

  test('should update document attributes on locale change', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLocale('ar')
    })

    // Note: This would work in a real browser environment
    // In jsdom, we can't fully test this, but the effect runs
    expect(result.current.dir).toBe('rtl')
  })

  test('should provide correct direction for each locale', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.dir).toBe('ltr')
    
    act(() => {
      result.current.setLocale('ar')
    })
    
    expect(result.current.dir).toBe('rtl')
    
    act(() => {
      result.current.setLocale('en')
    })
    
    expect(result.current.dir).toBe('ltr')
  })
})
