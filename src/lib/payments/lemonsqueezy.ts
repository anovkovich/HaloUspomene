import crypto from "crypto";

// Lemon Squeezy (merchant of record) API client — card rail. Server-only.
// Docs: https://docs.lemonsqueezy.com/api/checkouts + /webhooks

const LS_API = "https://api.lemonsqueezy.com/v1";

/** Checkout language. LS accepts hr / sl / bg / en / de / ru — but no Serbian
 *  ("sr", "sr-Latn" and "bs" are all rejected with a 422), so Croatian is the
 *  closest our customers can get. */
const LS_CHECKOUT_LOCALE = "hr";

/** Prefilled billing country. LS defaults the address to the United States,
 *  which reads as a foreign/scam form to a Serbian buyer staring at a card
 *  field. Every customer can still change it. */
const LS_BILLING_COUNTRY = "RS";

export interface CreateCheckoutParams {
  storeId: string;
  variantId: string;
  /** All values MUST be strings — LS drops non-string custom fields. */
  custom: Record<string, string>;
  redirectUrl: string;
  receiptButtonText?: string;
  receiptLinkUrl?: string;
  expiresAt: string; // ISO — the checkout dies with the frozen price
  /** Pre-applies a Lemon Squeezy discount code (flat value). Passed only when
   *  our server-side promo validation already passed. */
  discountCode?: string;
}

export async function createCheckout(
  p: CreateCheckoutParams,
): Promise<{ url: string; checkoutId: string }> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY not set");

  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: p.custom,
            billing_address: { country: LS_BILLING_COUNTRY },
            ...(p.discountCode ? { discount_code: p.discountCode } : {}),
          },
          // discount:false hides LS's own discount-code field. Codes are only
          // ever applied server-side (p.discountCode), after our validation and
          // BEFORE the order amount is frozen — a code typed at LS would make
          // the paid total disagree with that frozen amount and quarantine an
          // otherwise good order. Pre-applied codes still work with it hidden.
          //
          // locale MUST travel as a checkout option, never as a query param on
          // the returned URL: that URL is signed and LS validates the whole
          // query string, so appending ?locale= yields a 403 "Invalid
          // signature" on every checkout. LS has no Serbian locale ("sr" is
          // rejected); Croatian is the closest it offers.
          //
          // embed:true renders the checkout so Lemon.js can host it in an
          // overlay on our own page — buyers here distrust being thrown onto a
          // foreign domain to type card details. The client still falls back to
          // a plain redirect to this same URL if Lemon.js is blocked.
          checkout_options: {
            embed: true,
            media: false,
            logo: true,
            discount: false,
            locale: LS_CHECKOUT_LOCALE,
          },
          product_options: {
            redirect_url: p.redirectUrl,
            receipt_button_text: p.receiptButtonText,
            receipt_link_url: p.receiptLinkUrl,
          },
          expires_at: p.expiresAt,
        },
        relationships: {
          store: { data: { type: "stores", id: p.storeId } },
          variant: { data: { type: "variants", id: p.variantId } },
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LS checkout failed: ${res.status} ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    data: { id: string; attributes: { url: string } };
  };
  return { url: json.data.attributes.url, checkoutId: json.data.id };
}

/** Raw-body HMAC-SHA256 verification with timing-safe compare. The signature is
 *  over the exact bytes LS sent — always read req.text() BEFORE JSON.parse. */
export function verifySignature(
  raw: string,
  signature: string | null,
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = Buffer.from(
    crypto.createHmac("sha256", secret).update(raw).digest("hex"),
    "utf8",
  );
  const sig = Buffer.from(signature, "utf8");
  if (sig.length !== digest.length) return false;
  return crypto.timingSafeEqual(digest, sig);
}

// ── Webhook payload (only the fields we consume) ─────────────────────────────

export interface LsWebhook {
  meta: {
    event_name: string;
    test_mode?: boolean;
    custom_data?: Record<string, string>;
  };
  data: {
    id: string; // LS order id (numeric string)
    attributes: {
      status?: string; // "paid" | ...
      total?: number; // minor units (para) — INCLUDES tax when tax-exclusive
      tax?: number; // minor units — VAT LS added on top (0 for non-taxed buyers)
      subtotal?: number; // minor units — pre-discount, pre-tax
      discount_total?: number; // minor units — promo-code discount applied
      tax_inclusive?: boolean; // false = tax charged on top of our price
      currency?: string; // "RSD" (the store's charging currency)
      order_number?: number;
      user_email?: string;
      refunded?: boolean;
      refunded_amount?: number; // minor units
      urls?: { receipt?: string };
    };
  };
}

export function parseWebhook(raw: string): LsWebhook {
  return JSON.parse(raw) as LsWebhook;
}
