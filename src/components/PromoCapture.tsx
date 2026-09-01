"use client";

import { useEffect } from "react";

/**
 * Persists a `?promo=CODE` param into localStorage so a guest-referral promo
 * code survives the multi-page builder hop (landing → builder → new draft couple
 * → preview → /placanje), where `CheckoutPanel` reads it back. Renders nothing.
 */
export default function PromoCapture() {
  useEffect(() => {
    try {
      const code = new URLSearchParams(window.location.search).get("promo");
      if (code && code.trim()) {
        localStorage.setItem("hu_promo", code.trim().toUpperCase());
      }
    } catch {}
  }, []);
  return null;
}
