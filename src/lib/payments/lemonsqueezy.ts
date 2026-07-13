import crypto from "crypto";

// Lemon Squeezy (merchant of record) API client — card rail. Server-only.
// Docs: https://docs.lemonsqueezy.com/api/checkouts + /webhooks

const LS_API = "https://api.lemonsqueezy.com/v1";

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
            ...(p.discountCode ? { discount_code: p.discountCode } : {}),
          },
          checkout_options: { embed: false, media: false, logo: true },
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
      total?: number; // cents
      currency?: string; // "EUR"
      order_number?: number;
      user_email?: string;
      refunded?: boolean;
      refunded_amount?: number; // cents
      urls?: { receipt?: string };
    };
  };
}

export function parseWebhook(raw: string): LsWebhook {
  return JSON.parse(raw) as LsWebhook;
}
