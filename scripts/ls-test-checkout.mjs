// Builds the card checkout for a real pending order, with exactly the params
// createCardCheckout() would send — so this test exercises the production path
// without flipping PAYMENTS_CARD_ENABLED (which would expose the button to
// real customers). Reads the order back from Mongo; never invents an amount.
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";

const ROOT = "C:/Users/Aleksa/Documents/_nextjs_start/HaloUspomene";
const env = readFileSync(`${ROOT}/.env.local`, "utf8");
const pick = (k) => env.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const ORDER_ID = process.argv[2];
if (!ORDER_ID) {
  console.error("Upotreba: node make-test-checkout.mjs <orderId>");
  process.exit(1);
}

const uri = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/)[1];
const mc = new MongoClient(uri);
await mc.connect();
const order = await mc
  .db("halouspomene")
  .collection("orders")
  .findOne({ orderId: ORDER_ID });
await mc.close();

if (!order) {
  console.error("Narudzbina nije nadjena:", ORDER_ID);
  process.exit(1);
}
if (order.status !== "pending") {
  console.error(`Narudzbina je u statusu "${order.status}", ocekivano "pending".`);
  process.exit(1);
}

const VARIANT_ENV = {
  galerija: "LS_VARIANT_GALERIJA",
  raspored: "LS_VARIANT_RASPORED",
  rodjendan: "LS_VARIANT_PROSLAVA",
  punoletstvo: "LS_VARIANT_PROSLAVA",
};
const variantId =
  order.kind === "pozivnica"
    ? pick(
        { osnovni: "LS_VARIANT_OSNOVNI", kompletan: "LS_VARIANT_KOMPLETAN", premium: "LS_VARIANT_PREMIUM" }[
          order.tier
        ],
      )
    : pick(VARIANT_ENV[order.kind]);

const site = "https://halouspomene.rs";
const body = {
  data: {
    type: "checkouts",
    attributes: {
      checkout_data: {
        custom: {
          kind: order.kind,
          slug: order.slug,
          tier: order.tier,
          order_id: order.orderId,
        },
      },
      checkout_options: {
        embed: false,
        media: false,
        logo: true,
        discount: false,
        locale: "hr",
      },
      product_options: {
        redirect_url: `${site}/placanje/${order.kind}/${order.slug}/hvala/?order=${order.orderId}`,
        receipt_button_text: "Nazad na pozivnicu",
        receipt_link_url: `${site}/pozivnica/${order.slug}/`,
      },
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    relationships: {
      store: { data: { type: "stores", id: pick("LEMONSQUEEZY_STORE_ID") } },
      variant: { data: { type: "variants", id: variantId } },
    },
  },
};

const r = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
  method: "POST",
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${pick("LEMONSQUEEZY_API_KEY")}`,
  },
  body: JSON.stringify(body),
});
if (!r.ok) {
  console.error("LS greska:", r.status, (await r.text()).slice(0, 300));
  process.exit(1);
}
const url = (await r.json()).data.attributes.url;

console.log("\n=== TEST CHECKOUT ===");
console.log("  narudzbina :", order.orderId, `(${order.status})`);
console.log("  proizvod   :", order.kind, "/", order.slug, "tier:", order.tier);
console.log("  variant    :", variantId);
console.log("  iznos      :", order.amountRsd, "din");
console.log("  LS total MORA biti:", order.amountRsd * 100, "para");
console.log("\n  PLATI OVDE:");
console.log("  " + url);
console.log("\n  Posle placanja pokreni: node scripts/../check-test-order.mjs");
