import { NextRequest, NextResponse } from "next/server";
import { getGalleryCouples, patchCouple } from "@/lib/couples";
import { deleteAllGalleryPhotos } from "@/lib/gallery";
import { deleteByPrefix } from "@/lib/r2";
import { sendSms } from "@/lib/infobip";
import {
  galleryDayOffset,
  shouldPurgeGallery,
  GALLERY_ACCESS_LAST_DAY,
  GALLERY_PURGE_WARNING_DAY,
} from "@/lib/gallery-lifecycle";

/**
 * Gallery lifecycle cron. Triggered by Vercel Cron (see vercel.json).
 *
 *   GET /api/cron/gallery?task=remind   → SMS #1 (d4) + SMS #2 (d5)
 *   GET /api/cron/gallery?task=purge    → delete photos for couples at d6+
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET
 * is set in the project env. We reject anything that doesn't match.
 *
 * Both tasks are idempotent — flags on the couple (gallery_sms_*_sent,
 * gallery_purged_at) prevent double-send / double-delete on retries.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

// Diacritic-free on purpose: keeps each SMS to a single GSM-7 segment.
function smsLastAccess(): string {
  return `HaloUspomene: Danas je poslednji dan da preuzmete fotografije iz galerije sa vaseg vencanja. Otvorite: ${SITE}/moje-vencanje`;
}
function smsPurgeWarning(): string {
  return `HaloUspomene: Fotografije iz vase galerije bice trajno obrisane veceras. Ako vam jos trebaju, javite se timu: halouspomene@gmail.com`;
}

/** First phone from the comma-separated contact_phone, if E.164. */
function primaryPhone(contact?: string): string | null {
  const first = (contact || "").split(",")[0]?.trim();
  return first && first.startsWith("+") ? first : null;
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = new URL(req.url).searchParams.get("task");
  if (task !== "remind" && task !== "purge") {
    return NextResponse.json(
      { error: "task must be 'remind' or 'purge'" },
      { status: 400 }
    );
  }

  const couples = await getGalleryCouples();
  const result = { task, processed: 0, sms: 0, purged: 0, errors: [] as string[] };

  for (const c of couples) {
    try {
      if (task === "remind") {
        const d = galleryDayOffset(c.event_date);
        if (d === null) continue;
        const phone = primaryPhone(c.contact_phone);
        if (!phone) continue;

        if (d === GALLERY_ACCESS_LAST_DAY && !c.gallery_sms_last_access_sent) {
          await sendSms(phone, smsLastAccess());
          await patchCouple(c.slug, { gallery_sms_last_access_sent: true });
          result.sms++;
        } else if (
          d === GALLERY_PURGE_WARNING_DAY &&
          !c.gallery_sms_purge_warning_sent
        ) {
          await sendSms(phone, smsPurgeWarning());
          await patchCouple(c.slug, { gallery_sms_purge_warning_sent: true });
          result.sms++;
        }
        result.processed++;
      } else {
        // purge
        if (
          shouldPurgeGallery(c.event_date, c.gallery_extra_days ?? 0) &&
          !c.gallery_purged_at
        ) {
          await deleteByPrefix(`gallery/${c.slug}/`);
          await deleteAllGalleryPhotos(c.slug);
          await patchCouple(c.slug, {
            gallery_purged_at: new Date().toISOString(),
          });
          result.purged++;
        }
        result.processed++;
      }
    } catch (err) {
      result.errors.push(
        `${c.slug}: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  }

  return NextResponse.json(result);
}
