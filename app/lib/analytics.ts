'use client';

// Google Analytics, Meta Pixel, and TikTok Pixel event tracking helpers

export const trackEvent = (eventName: string, params: any) => {
  if (typeof window !== 'undefined') {
    // 1. Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }
    // 2. Meta Pixel
    if (typeof (window as any).fbq === 'function') {
      const fbEvent = getMetaEventName(eventName);
      if (fbEvent) {
        (window as any).fbq('track', fbEvent, params);
      }
    }
    // 3. TikTok Pixel
    if (typeof (window as any).ttq === 'object' && typeof (window as any).ttq.track === 'function') {
      const ttEvent = getTikTokEventName(eventName);
      if (ttEvent) {
        (window as any).ttq.track(ttEvent, params);
      }
    }
  }
};

const getMetaEventName = (gaEvent: string) => {
  switch (gaEvent) {
    case 'view_item': return 'ViewContent';
    case 'add_to_cart': return 'AddToCart';
    case 'begin_checkout': return 'InitiateCheckout';
    case 'purchase': return 'Purchase';
    case 'search': return 'Search';
    case 'add_to_wishlist': return 'AddToWishlist';
    default: return null;
  }
};

const getTikTokEventName = (gaEvent: string) => {
  switch (gaEvent) {
    case 'view_item': return 'ViewContent';
    case 'add_to_cart': return 'AddToCart';
    case 'begin_checkout': return 'InitiateCheckout';
    case 'purchase': return 'PlaceAnOrder';
    case 'search': return 'Search';
    case 'add_to_wishlist': return 'AddToWishlist';
    default: return null;
  }
};

// Helper tracking wrappers
export const trackProductView = (product: any) => {
  trackEvent('view_item', {
    currency: 'EGP',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category?.name || 'Chocolate',
      quantity: 1
    }]
  });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  trackEvent('add_to_cart', {
    currency: 'EGP',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category?.name || 'Chocolate',
      quantity: quantity
    }]
  });
};

export const trackRemoveFromCart = (product: any) => {
  trackEvent('remove_from_cart', {
    currency: 'EGP',
    value: product.price * (product.quantity || 1),
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1
    }]
  });
};

export const trackCheckoutStart = (items: any[], total: number) => {
  trackEvent('begin_checkout', {
    currency: 'EGP',
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackPurchase = (order: any) => {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'EGP',
    value: order.total,
    items: order.items?.map((item: any) => ({
      item_id: item.productId,
      item_name: item.product?.name || 'Chocolate',
      price: item.price,
      quantity: item.quantity
    })) || []
  });
};

export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', {
    event_category: 'Contact',
    event_label: 'WhatsApp Floating Button'
  });
};

export const trackSearchEvent = (query: string) => {
  trackEvent('search', {
    search_term: query
  });
};

export const trackWishlistEvent = (action: 'add' | 'remove', product: any) => {
  trackEvent('add_to_wishlist', {
    currency: 'EGP',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price
    }]
  });
};
