// Input validation utilities
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^(?:01[0125]\d{8}|(?:\+?20|0020)1[0125]\d{8})$/.test(normalized);
}

export function normalizePhoneNumber(phone: string): string {
  return phone
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s\-()]/g, '');
}

export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0;
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateImageValue(value: unknown, allowProductImageRoute = false): value is string {
  if (typeof value !== 'string' || value.length > 16 * 1024 * 1024) return false;
  if (validateUrl(value)) return true;
  if (allowProductImageRoute && /^\/api\/products\/[A-Za-z0-9_-]+\/image(?:\?index=\d+(?:&v=\d+)?)?$/.test(value)) return true;
  return /^data:image\/(?:jpeg|png|webp|gif|avif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(value);
}

export function validateRequired(value: unknown, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateProductInput(data: Record<string, unknown>): void {
  validateRequired(data.name, 'Product name');
  validateRequired(data.nameAr, 'Product name (Arabic)');
  validateRequired(data.description, 'Description');
  validateRequired(data.descriptionAr, 'Description (Arabic)');
  validateRequired(data.price, 'Price');
  validateRequired(data.categoryId, 'Category');
  
  if (typeof data.price !== 'number' || !validatePrice(data.price)) {
    throw new Error('Invalid price value');
  }
  
  if (!validateImageValue(data.image)) {
    throw new Error('Invalid image URL');
  }

  if (data.images !== undefined && (!Array.isArray(data.images) || data.images.length > 12 ||
      data.images.some((image: unknown) => !validateImageValue(image)) ||
      data.images.reduce<number>((total, image) => total + (typeof image === 'string' ? image.length : 0), 0) +
        (typeof data.image === 'string' ? data.image.length : 0) > 20 * 1024 * 1024)) {
    throw new Error('Product images are invalid or exceed the allowed size.');
  }
}

export function validateOrderInput(data: Record<string, unknown>): void {
  validateRequired(data.customerName, 'Customer name');
  validateRequired(data.customerPhone, 'Phone number');
  validateRequired(data.customerAddress, 'Delivery address');
  validateRequired(data.items, 'Order items');
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }
  
  if (typeof data.customerEmail === 'string' && data.customerEmail && !validateEmail(data.customerEmail)) {
    throw new Error('Invalid email address');
  }

  if (typeof data.customerName !== 'string' || data.customerName.trim().length > 120 ||
      typeof data.customerAddress !== 'string' || data.customerAddress.trim().length > 500 ||
      typeof data.customerPhone !== 'string' || !validatePhone(data.customerPhone) ||
      (typeof data.customerEmail === 'string' && data.customerEmail.length > 254) ||
      (data.specialRequests && (typeof data.specialRequests !== 'string' || data.specialRequests.length > 1000))) {
    throw new Error('Some order details are invalid or too long.');
  }
}

export function validateCategoryInput(data: Record<string, unknown>): void {
  validateRequired(data.name, 'Category name');
  validateRequired(data.nameAr, 'Category name (Arabic)');
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
