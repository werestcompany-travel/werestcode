'use client';

// Typed GA4 + @vercel/analytics event helpers.
// Call these from client components after key conversion actions.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(event: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

// Fired when user starts the booking form
export function trackBeginCheckout(vehicleType: string, estimatedPrice: number) {
  gtag('begin_checkout', {
    currency: 'THB',
    value: estimatedPrice,
    items: [{ item_id: vehicleType, item_name: `Private Transfer — ${vehicleType}`, price: estimatedPrice }],
  });
}

// Fired when booking is successfully created
export function trackPurchase(bookingRef: string, vehicleType: string, totalPrice: number) {
  gtag('purchase', {
    transaction_id: bookingRef,
    currency:       'THB',
    value:          totalPrice,
    items: [{ item_id: vehicleType, item_name: `Private Transfer — ${vehicleType}`, price: totalPrice }],
  });
}

// Fired when tour detail page is viewed
export function trackViewItem(tourSlug: string, tourTitle: string, priceFrom: number) {
  gtag('view_item', {
    currency: 'THB',
    value:    priceFrom,
    items:    [{ item_id: tourSlug, item_name: tourTitle, price: priceFrom, item_category: 'Tour' }],
  });
}

// Fired when attraction ticket checkout starts
export function trackAttractionCheckout(attractionName: string, totalPrice: number) {
  gtag('begin_checkout', {
    currency: 'THB',
    value:    totalPrice,
    items:    [{ item_name: attractionName, price: totalPrice, item_category: 'Attraction' }],
  });
}
