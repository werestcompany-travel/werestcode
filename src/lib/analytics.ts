// Safe gtag wrapper — works even when GA_ID is not set
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Specific conversion events
export function trackBookingStarted(vehicleType: string, estimatedPrice: number) {
  trackEvent('begin_checkout', { vehicle_type: vehicleType, value: estimatedPrice, currency: 'THB' })
}

export function trackBookingCompleted(bookingRef: string, totalPrice: number, vehicleType: string) {
  trackEvent('purchase', {
    transaction_id: bookingRef,
    value: totalPrice,
    currency: 'THB',
    vehicle_type: vehicleType,
  })
}

export function trackTourBookingCompleted(bookingRef: string, totalPrice: number, tourSlug: string) {
  trackEvent('purchase', {
    transaction_id: bookingRef,
    value: totalPrice,
    currency: 'THB',
    item_category: 'tour',
    item_id: tourSlug,
  })
}

export function trackAttractionBookingCompleted(bookingRef: string, totalPrice: number, attractionSlug: string) {
  trackEvent('purchase', {
    transaction_id: bookingRef,
    value: totalPrice,
    currency: 'THB',
    item_category: 'attraction',
    item_id: attractionSlug,
  })
}

export function trackSearchPerformed(query: string, resultCount: number) {
  trackEvent('search', { search_term: query, result_count: resultCount })
}
