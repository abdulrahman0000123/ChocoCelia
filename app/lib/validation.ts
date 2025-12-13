// Input validation utilities
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Egyptian phone number format
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
}

export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateProductInput(data: any): void {
  validateRequired(data.name, 'Product name');
  validateRequired(data.nameAr, 'Product name (Arabic)');
  validateRequired(data.description, 'Description');
  validateRequired(data.descriptionAr, 'Description (Arabic)');
  validateRequired(data.price, 'Price');
  validateRequired(data.categoryId, 'Category');
  
  if (!validatePrice(data.price)) {
    throw new Error('Invalid price value');
  }
  
  if (data.image && !validateUrl(data.image)) {
    throw new Error('Invalid image URL');
  }
}

export function validateOrderInput(data: any): void {
  validateRequired(data.customerName, 'Customer name');
  validateRequired(data.customerPhone, 'Phone number');
  validateRequired(data.customerAddress, 'Delivery address');
  validateRequired(data.items, 'Order items');
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }
  
  if (data.customerEmail && !validateEmail(data.customerEmail)) {
    throw new Error('Invalid email address');
  }
}

export function validateCategoryInput(data: any): void {
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
