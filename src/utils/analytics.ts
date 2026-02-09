// GA4 Event Tracking Helper
// Usage: trackEvent('form_submit', { form_name: 'contact' })

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Pre-defined event helpers
export const analytics = {
  formSubmit: (formName: string) =>
    trackEvent("form_submit", { form_name: formName }),

  packageClick: (packageName: string) =>
    trackEvent("package_click", { package_name: packageName }),

  ctaClick: (ctaName: string, location: string) =>
    trackEvent("cta_click", { cta_name: ctaName, cta_location: location }),

  pageView: (pagePath: string, pageTitle: string) =>
    trackEvent("page_view", { page_path: pagePath, page_title: pageTitle }),

  blogRead: (slug: string, title: string) =>
    trackEvent("blog_read", { blog_slug: slug, blog_title: title }),

  locationView: (city: string) =>
    trackEvent("location_view", { city_name: city }),
};
