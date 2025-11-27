import { translations } from '@/app/lib/translations'

describe('Translations System', () => {
  test('should have English translations', () => {
    expect(translations.en).toBeDefined()
    expect(translations.en.home).toBe('Home')
    expect(translations.en.menu).toBe('Menu')
    expect(translations.en.cart).toBe('Cart')
  })

  test('should have Arabic translations', () => {
    expect(translations.ar).toBeDefined()
    expect(translations.ar.home).toBe('الرئيسية')
    expect(translations.ar.menu).toBe('القائمة')
    expect(translations.ar.cart).toBe('السلة')
  })

  test('English and Arabic should have same keys', () => {
    const enKeys = Object.keys(translations.en).sort()
    const arKeys = Object.keys(translations.ar).sort()

    expect(enKeys).toEqual(arKeys)
  })

  test('should have all common navigation keys', () => {
    const commonKeys = ['home', 'menu', 'about', 'contact', 'cart']
    
    commonKeys.forEach(key => {
      expect(translations.en).toHaveProperty(key)
      expect(translations.ar).toHaveProperty(key)
    })
  })

  test('should have all shopping cart keys', () => {
    const cartKeys = ['addToCart', 'cart', 'checkout', 'total', 'quantity', 'price']
    
    cartKeys.forEach(key => {
      expect(translations.en).toHaveProperty(key)
      expect(translations.ar).toHaveProperty(key)
    })
  })

  test('should have all admin panel keys', () => {
    const adminKeys = [
      'adminLogin', 
      'dashboard', 
      'products', 
      'orders', 
      'settings',
      'addProduct',
      'edit',
      'delete',
      'save'
    ]
    
    adminKeys.forEach(key => {
      expect(translations.en).toHaveProperty(key)
      expect(translations.ar).toHaveProperty(key)
    })
  })

  test('all translation values should be strings', () => {
    Object.values(translations.en).forEach(value => {
      expect(typeof value).toBe('string')
    })

    Object.values(translations.ar).forEach(value => {
      expect(typeof value).toBe('string')
    })
  })

  test('no translation should be empty', () => {
    Object.values(translations.en).forEach(value => {
      expect(value.length).toBeGreaterThan(0)
    })

    Object.values(translations.ar).forEach(value => {
      expect(value.length).toBeGreaterThan(0)
    })
  })

  test('should have form field translations', () => {
    const formKeys = ['name', 'email', 'message', 'phone', 'send']
    
    formKeys.forEach(key => {
      expect(translations.en).toHaveProperty(key)
      expect(translations.ar).toHaveProperty(key)
    })
  })
})
