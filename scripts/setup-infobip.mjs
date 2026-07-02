/**
 * One-shot bootstrap: create Infobip 2FA application + message template.
 *
 * Usage:
 *   node --env-file=.env.local scripts/setup-infobip.mjs
 *
 * After it runs, copy the printed INFOBIP_2FA_APP_ID and INFOBIP_2FA_MESSAGE_ID
 * into .env.local and Vercel env. Re-running the script is safe — it lists
 * existing applications and reuses one named "HaloUspomene_App" if present.
 */

const RAW_BASE = process.env.INFOBIP_BASE_URL;
const BASE_URL = RAW_BASE
  ? RAW_BASE.startsWith("http") ? RAW_BASE.replace(/\/$/, "") : `https://${RAW_BASE.replace(/\/$/, "")}`
  : null;
const API_KEY = process.env.INFOBIP_API_KEY;
const APP_NAME = "HaloUspomene_App";
const SMS_SENDER = process.env.INFOBIP_SMS_SENDER || "HaloUspom";
const PIN_LENGTH = 4;
const MESSAGE_TEXT =
  "HaloUspomene verifikacioni kod koji vazi narednih 5 minuta je: {{pin}}";

if (!BASE_URL || !API_KEY) {
  console.error("INFOBIP_BASE_URL and INFOBIP_API_KEY must be set in .env.local");
  process.exit(1);
}

async function ib(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `App ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    console.error(`Infobip ${init.method || "GET"} ${path} failed (${res.status}):`);
    console.error(body);
    process.exit(2);
  }
  return body;
}

async function findOrCreateApp() {
  console.log(`\n→ Looking for existing application "${APP_NAME}"...`);
  const list = await ib("/2fa/2/applications");
  const existing = Array.isArray(list)
    ? list.find((a) => a?.name === APP_NAME)
    : null;
  if (existing) {
    console.log(`  ✓ Reusing existing app: ${existing.applicationId}`);
    return existing.applicationId;
  }

  console.log(`  Creating new application...`);
  const created = await ib("/2fa/2/applications", {
    method: "POST",
    body: JSON.stringify({
      name: APP_NAME,
      enabled: true,
      configuration: {
        pinAttempts: 5,
        allowMultiplePinVerifications: true,
        pinTimeToLive: "5m",
        verifyPinLimit: "1/3s",
        sendPinPerApplicationLimit: "10000/1d",
        sendPinPerPhoneNumberLimit: "3/1d",
      },
    }),
  });
  console.log(`  ✓ Created app: ${created.applicationId}`);
  return created.applicationId;
}

async function findOrCreateTemplate(appId) {
  console.log(`\n→ Looking for existing message template on app ${appId}...`);
  const list = await ib(`/2fa/2/applications/${appId}/messages`);
  const existing = Array.isArray(list)
    ? list.find(
        (m) =>
          m?.pinType === "NUMERIC" &&
          m?.pinLength === PIN_LENGTH &&
          m?.messageText === MESSAGE_TEXT,
      )
    : null;
  if (existing) {
    console.log(`  ✓ Reusing existing template: ${existing.messageId}`);
    return existing.messageId;
  }

  console.log(`  Creating new message template...`);
  const created = await ib(`/2fa/2/applications/${appId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      pinType: "NUMERIC",
      pinLength: PIN_LENGTH,
      messageText: MESSAGE_TEXT,
      senderId: SMS_SENDER,
      language: { languageCode: "sr" },
      repeatDND: false,
    }),
  });
  console.log(`  ✓ Created template: ${created.messageId}`);
  return created.messageId;
}

const appId = await findOrCreateApp();
const messageId = await findOrCreateTemplate(appId);

console.log("\n========================================");
console.log("Add these to .env.local AND Vercel env:");
console.log("========================================");
console.log(`INFOBIP_2FA_APP_ID=${appId}`);
console.log(`INFOBIP_2FA_MESSAGE_ID=${messageId}`);
console.log("========================================\n");
