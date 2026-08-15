import { NextRequest, NextResponse } from "next/server";
import { getGalleryCouples, patchCouple } from "@/lib/couples";
import {
  listGalleryStandaloneSeatings,
  patchStandaloneGalleryLifecycle,
} from "@/lib/standalone-seating";
import {
  listGalleryBirthdays,
  patchBirthdayGalleryLifecycle,
} from "@/lib/birthday";
import { deleteAllGalleryPhotos } from "@/lib/gallery";
import { deleteByPrefix } from "@/lib/r2";
import { sendSms } from "@/lib/infobip";
import {
  findSeatingSmsCandidates,
  seatingOfferSms,
} from "@/lib/seating/nudge-sms";
import {
  galleryDayOffset,
  shouldPurgeGallery,
  GALLERY_ACCESS_LAST_DAY,
  GALLERY_PURGE_WARNING_DAY,
} from "@/lib/gallery-lifecycle";

/**
 * Gallery lifecycle cron. Triggered by GitHub Actions —
 * `.github/workflows/gallery-lifecycle.yml`, NOT Vercel Cron (there is no
 * vercel.json). Scheduled workflows only fire from the repo's DEFAULT branch,
 * which is `deploy` for exactly this reason.
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

// Standalone events aren't weddings — link the owner portal instead of /moje-vencanje.
function smsLastAccessBirthday(slug: string, isEighteenth: boolean): string {
  const base = isEighteenth ? "punoletstvo" : "deciji-rodjendan";
  return `HaloUspomene: Danas je poslednji dan da preuzmete fotografije iz galerije sa proslave. Otvorite: ${SITE}/${base}/${slug}/portal`;
}

function smsLastAccessStandalone(slug: string): string {
  return `HaloUspomene: Danas je poslednji dan da preuzmete fotografije iz galerije. Otvorite: ${SITE}/raspored-sedenja/${slug}/portal`;
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

  // ── Standalone seatings with the gallery add-on ──────────────────────────
  // Same lifecycle math (event_date based) with the seating record's own
  // idempotency flags. Reminders link the owner portal, not /moje-vencanje.
  const seatings = await listGalleryStandaloneSeatings();
  for (const s of seatings) {
    try {
      if (task === "remind") {
        const d = galleryDayOffset(s.eventDate);
        if (d === null) continue;
        const phone =
          s.ownerPhone && s.ownerPhone.startsWith("+") ? s.ownerPhone : null;
        if (!phone) continue;

        if (
          d === GALLERY_ACCESS_LAST_DAY &&
          !s.gallery_sms_last_access_sent
        ) {
          await sendSms(phone, smsLastAccessStandalone(s.slug));
          await patchStandaloneGalleryLifecycle(s.slug, {
            gallery_sms_last_access_sent: true,
          });
          result.sms++;
        } else if (
          d === GALLERY_PURGE_WARNING_DAY &&
          !s.gallery_sms_purge_warning_sent
        ) {
          await sendSms(phone, smsPurgeWarning());
          await patchStandaloneGalleryLifecycle(s.slug, {
            gallery_sms_purge_warning_sent: true,
          });
          result.sms++;
        }
        result.processed++;
      } else {
        // purge
        if (
          shouldPurgeGallery(s.eventDate, s.gallery_extra_days ?? 0) &&
          !s.gallery_purged_at
        ) {
          await deleteByPrefix(`gallery/${s.slug}/`);
          await deleteAllGalleryPhotos(s.slug);
          await patchStandaloneGalleryLifecycle(s.slug, {
            gallery_purged_at: new Date().toISOString(),
          });
          result.purged++;
        }
        result.processed++;
      }
    } catch (err) {
      result.errors.push(
        `${s.slug}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // ── Birthday events (dečiji rođendan + punoletstvo) with the gallery ─────
  // Same lifecycle math on the shared `birthday_events` collection. The
  // reminder links whichever product the record belongs to.
  const birthdays = await listGalleryBirthdays();
  for (const b of birthdays) {
    try {
      if (task === "remind") {
        const d = galleryDayOffset(b.event_date);
        if (d === null) continue;
        // No phone ⇒ no warning is possible, so skip rather than purge blind;
        // the sale is supposed to require `contact_phone` for exactly this.
        const phone =
          b.contact_phone && b.contact_phone.startsWith("+")
            ? b.contact_phone
            : null;
        if (!phone) continue;

        if (d === GALLERY_ACCESS_LAST_DAY && !b.gallery_sms_last_access_sent) {
          await sendSms(
            phone,
            smsLastAccessBirthday(b.slug, b.type === "eighteenth"),
          );
          await patchBirthdayGalleryLifecycle(b.slug, {
            gallery_sms_last_access_sent: true,
          });
          result.sms++;
        } else if (
          d === GALLERY_PURGE_WARNING_DAY &&
          !b.gallery_sms_purge_warning_sent
        ) {
          await sendSms(phone, smsPurgeWarning());
          await patchBirthdayGalleryLifecycle(b.slug, {
            gallery_sms_purge_warning_sent: true,
          });
          result.sms++;
        }
        result.processed++;
      } else {
        // purge
        if (
          shouldPurgeGallery(b.event_date, b.gallery_extra_days ?? 0) &&
          !b.gallery_purged_at
        ) {
          await deleteByPrefix(`gallery/${b.slug}/`);
          await deleteAllGalleryPhotos(b.slug);
          await patchBirthdayGalleryLifecycle(b.slug, {
            gallery_purged_at: new Date().toISOString(),
          });
          result.purged++;
        }
        result.processed++;
      }
    } catch (err) {
      result.errors.push(
        `${b.slug}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // ── Seating-tool offer SMS ───────────────────────────────────────────────
  // Rides the daily remind pass rather than getting its own workflow: same
  // civilised hour, and the eligibility rules live in `nudge-sms.ts`.
  if (task === "remind") {
    try {
      for (const cand of await findSeatingSmsCandidates()) {
        try {
          await sendSms(cand.phone, seatingOfferSms());
          await patchCouple(cand.slug, { seating_sms_offer_sent: true });
          result.sms++;
        } catch (err) {
          result.errors.push(
            `seating-sms ${cand.slug}: ${err instanceof Error ? err.message : "unknown"}`,
          );
        }
      }
    } catch (err) {
      result.errors.push(
        `seating-sms: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  return NextResponse.json(result);
}
