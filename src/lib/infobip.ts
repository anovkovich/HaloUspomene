/**
 * Infobip 2FA Verify API client.
 *
 * Uses /2fa/2/* endpoints. Application + message template are created once
 * via scripts/setup-infobip.mjs (results land in INFOBIP_2FA_APP_ID and
 * INFOBIP_2FA_MESSAGE_ID env vars).
 *
 * Channel strategy: SMS as the default delivery channel. Viber failover can
 * be added later by extending the message template (Infobip dashboard or via
 * setup script) — sender IDs differ per channel.
 *
 * PIN length: 4 digits, numeric (configured at template creation time).
 */

const RAW_BASE = process.env.INFOBIP_BASE_URL;
const BASE_URL = RAW_BASE
  ? RAW_BASE.startsWith("http")
    ? RAW_BASE.replace(/\/$/, "")
    : `https://${RAW_BASE.replace(/\/$/, "")}`
  : undefined;
const API_KEY = process.env.INFOBIP_API_KEY;
const APP_ID = process.env.INFOBIP_2FA_APP_ID;
const MESSAGE_ID = process.env.INFOBIP_2FA_MESSAGE_ID;
const SMS_SENDER = process.env.INFOBIP_SMS_SENDER || "HaloUspom";

export class InfobipError extends Error {
  constructor(
    message: string,
    public code:
      | "missing_config"
      | "invalid_phone"
      | "no_credit"
      | "expired_pin"
      | "wrong_pin"
      | "rate_limit"
      | "network"
      | "unknown",
    public status?: number,
    public infobipMessageId?: string,
  ) {
    super(message);
    this.name = "InfobipError";
  }
}

interface InfobipErrorBody {
  requestError?: {
    serviceException?: {
      messageId?: string;
      text?: string;
    };
  };
}

interface SendPinResponse {
  pinId: string;
  to: string;
  ncStatus?: string;
  smsStatus?: string;
}

interface VerifyPinResponse {
  pinId: string;
  msisdn: string;
  verified: boolean;
  attemptsRemaining?: number;
}

function assertConfig(): void {
  if (!BASE_URL || !API_KEY) {
    throw new InfobipError(
      "INFOBIP_BASE_URL or INFOBIP_API_KEY missing",
      "missing_config",
    );
  }
  if (!APP_ID || !MESSAGE_ID) {
    throw new InfobipError(
      "INFOBIP_2FA_APP_ID or INFOBIP_2FA_MESSAGE_ID missing — run scripts/setup-infobip.mjs",
      "missing_config",
    );
  }
}

async function infobipFetch<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `App ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new InfobipError("Network error contacting Infobip", "network");
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const err = body as InfobipErrorBody;
    const messageId = err?.requestError?.serviceException?.messageId;
    const text = err?.requestError?.serviceException?.text || "Infobip error";
    throw new InfobipError(text, mapErrorCode(messageId), res.status, messageId);
  }
  return body as T;
}

function mapErrorCode(messageId: string | undefined): InfobipError["code"] {
  switch (messageId) {
    case "BAD_REQUEST":
    case "INVALID_REQUEST":
      return "invalid_phone";
    case "NO_CREDIT":
      return "no_credit";
    case "EXPIRED":
      return "expired_pin";
    case "WRONG_PIN":
      return "wrong_pin";
    case "TOO_MANY_REQUESTS":
      return "rate_limit";
    default:
      return "unknown";
  }
}

/**
 * Send a 4-digit PIN to the phone via the configured Infobip 2FA app.
 * @param phoneE164 — E.164 phone, e.g. "+38161234567"
 * @returns pinId to be used with verifyCode()
 */
export async function sendVerificationCode(phoneE164: string): Promise<string> {
  assertConfig();
  const to = phoneE164.replace(/^\+/, "");
  const res = await infobipFetch<SendPinResponse>(
    "/2fa/2/pin?ncNeeded=false",
    {
      method: "POST",
      body: JSON.stringify({
        applicationId: APP_ID,
        messageId: MESSAGE_ID,
        from: SMS_SENDER,
        to,
      }),
    },
  );
  return res.pinId;
}

/**
 * Verify a 4-digit PIN against an active session.
 * @returns true on success, false otherwise.
 */
export async function verifyCode(pinId: string, code: string): Promise<boolean> {
  assertConfig();
  try {
    const res = await infobipFetch<VerifyPinResponse>(
      `/2fa/2/pin/${pinId}/verify`,
      {
        method: "POST",
        body: JSON.stringify({ pin: code }),
      },
    );
    return res.verified === true;
  } catch (err) {
    if (err instanceof InfobipError && (err.code === "wrong_pin" || err.code === "expired_pin")) {
      return false;
    }
    throw err;
  }
}
