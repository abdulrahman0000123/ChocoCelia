type ProductWithImages = {
  id: string;
  image: string;
  images: string[];
  updatedAt: Date | string;
};

function imageUrl(productId: string, index: number, updatedAt: Date | string, value: string) {
  if (!value) return value;
  if (!value.startsWith('data:image/') && !/^[A-Za-z0-9+/]+=*$/.test(value)) return value;
  const version = updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime();
  return `/api/products/${encodeURIComponent(productId)}/image?index=${index}&v=${version}`;
}

export function toPublicProduct<T extends ProductWithImages>(product: T) {
  return {
    ...product,
    image: imageUrl(product.id, 0, product.updatedAt, product.image),
    images: product.images.map((image, index) => imageUrl(product.id, index + 1, product.updatedAt, image)),
  };
}

export function restoreStoredProductImage(
  value: string,
  product: { id: string; image: string; images: string[] },
) {
  const match = value.match(/^\/api\/products\/([^/]+)\/image(?:\?(.*))?$/);
  if (!match) return value;
  try {
    if (decodeURIComponent(match[1]) !== product.id) return value;
    const sourceIndex = Number(new URLSearchParams(match[2] || '').get('index') || 0);
    if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return value;
    return sourceIndex === 0 ? product.image : product.images[sourceIndex - 1] || value;
  } catch {
    return value;
  }
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  return (configuredUrl || 'https://choco-celia2.vercel.app').replace(/\/$/, '');
}
