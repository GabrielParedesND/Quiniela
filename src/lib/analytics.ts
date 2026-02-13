// Analytics helper for tracking landing page events
// Supports Google Tag Manager (GTM) and custom dataLayer

export type LandingEvent =
  | 'view_landing'
  | 'click_register'
  | 'submit_register'
  | 'click_how_it_works'
  | 'click_prizes';

interface EventData {
  event: LandingEvent;
  [key: string]: any;
}

export function trackEvent(event: LandingEvent, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const eventData: EventData = {
    event,
    ...data,
  };

  // Google Tag Manager / dataLayer
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push(eventData);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventData);
  }
}

// Track page view (call in useEffect)
export function trackPageView() {
  trackEvent('view_landing', {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
