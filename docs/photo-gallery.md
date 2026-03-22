# Feature Plan: Wedding Photo Gallery

## Overview

Guests upload photos from the wedding day via QR code → browser. Couple gets a private, themed gallery page with all photos. Works on any phone, no app install needed.

## Business Model

- **Paid feature** (`paid_for_gallery?: boolean`) — no free tier
- Upsell alongside audio guest book and seating chart
- Storage cost is near-zero on Cloudflare R2

---

## User Flow

### Guest Flow (upload)
```
1. Guest scans QR code at wedding (printed card on table, or link in invitation)
2. Opens /pozivnica/[slug]/galerija
3. Sees couple's themed gallery page
4. Taps "Dodaj fotografiju" (Add photo)
5. Enters name, selects photo(s) from phone, optional caption
6. Photo uploads directly to Cloudflare R2 via presigned URL
7. Photo appears in gallery (after auto-approval or moderation)
```

### Couple Flow (manage)
```
1. Couple opens /pozivnica/[slug]/galerija (password-protected management)
2. Sees all uploaded photos in grid
3. Can: approve/reject, delete, download all as ZIP
4. Stats: total photos, unique uploaders
```

### Invitation Integration
```
- Gallery link shown on invitation page (conditional on paid_for_gallery)
- QR code on seating PDF (optional)
- Link in footer: "Podelite vaše fotografije" (Share your photos)
```

---

## Storage: Cloudflare R2

### Why R2 (not Vercel Blob)

| Aspect | Cloudflare R2 | Vercel Blob |
|--------|--------------|-------------|
| Free tier | 10 GB/month | 1 GB total |
| Egress | **$0 forever** | $0.15/GB after 1GB |
| Storage cost | $0.015/GB/month | $0.035/GB/month |
| S3 compatible | Yes | No |
| Presigned URLs | Yes (direct browser upload) | Yes |
| Scale | Unlimited | Limited on free plan |

**R2 wins on cost** — wedding photos are heavy on egress (guests view gallery repeatedly). Zero egress fees is the killer feature.

### R2 Free Tier (more than enough)

| Resource | Free Limit | Typical Wedding |
|----------|-----------|-----------------|
| Storage | 10 GB/month | ~2-5 GB per wedding (200-500 photos at 5-10MB each) |
| Class A ops (writes) | 1M/month | ~500 per wedding |
| Class B ops (reads) | 10M/month | ~5K per wedding |
| Egress | **Unlimited, $0** | Heavy (gallery views) |

One wedding fits comfortably in the free tier. Multiple active weddings still likely fit.

### R2 Setup

1. Create R2 bucket in Cloudflare dashboard (e.g. `halouspomene-gallery`)
2. Generate API token with R2 read/write permissions
3. Get: Account ID, Access Key ID, Secret Access Key
4. Store in env vars:
   ```
   R2_ACCOUNT_ID="..."
   R2_ACCESS_KEY_ID="..."
   R2_SECRET_ACCESS_KEY="..."
   R2_BUCKET_NAME="halouspomene-gallery"
   R2_PUBLIC_URL="https://gallery.halouspomene.rs"  # Custom domain or R2 public URL
   ```

### R2 Bucket Configuration

- Enable **public access** via custom domain or R2.dev subdomain
- CORS policy: allow `halouspomene.rs` origin for presigned uploads
- Object lifecycle: optional auto-delete after 1 year (cost control)

---

## Architecture

### Upload Flow (presigned URL pattern)

```
Browser                    Vercel (API Route)              Cloudflare R2
  │                              │                              │
  │  POST /api/.../upload/sign   │                              │
  │  { fileName, fileType }      │                              │
  │─────────────────────────────>│                              │
  │                              │  Generate presigned PUT URL  │
  │                              │  (aws-sdk, no file transfer) │
  │                              │                              │
  │  { presignedUrl, key }       │                              │
  │<─────────────────────────────│                              │
  │                              │                              │
  │  PUT presignedUrl            │                              │
  │  (binary file data)          │                              │
  │──────────────────────────────────────────────────────────>  │
  │                              │                              │
  │  200 OK                      │                              │
  │<──────────────────────────────────────────────────────────  │
  │                              │                              │
  │  POST /api/.../upload/confirm│                              │
  │  { key, guestName, caption } │                              │
  │─────────────────────────────>│                              │
  │                              │  Save metadata to MongoDB    │
  │                              │                              │
  │  { success: true, photoId }  │                              │
  │<─────────────────────────────│                              │
```

**Why presigned URLs?**
- File goes directly from phone → R2 (no Vercel bandwidth cost)
- Vercel API route only handles metadata (~1KB)
- Avoids Vercel's 4.5MB request body limit
- Faster upload for large photos

### Data Model

**MongoDB collection: `gallery_photos`**

```typescript
interface PhotoDocument {
  _id: ObjectId;
  slug: string;           // which couple
  key: string;            // R2 object key: "ana-dejan/1710765432-abc123.jpg"
  url: string;            // public URL: "https://gallery.halouspomene.rs/ana-dejan/..."
  thumbnailUrl?: string;  // optional resized version
  guestName: string;
  caption: string;
  uploadedAt: Date;
  fileSize: number;       // bytes
  mimeType: string;       // "image/jpeg", "image/png", "image/webp"
  width?: number;         // original dimensions (from client)
  height?: number;
  approved: boolean;      // moderation flag (default: true for auto-approve)
}
```

**Index:** `{ slug: 1, uploadedAt: -1 }` for efficient per-couple queries.

---

## File Structure

### New Files

```
src/
├── lib/
│   ├── gallery.ts                           # MongoDB CRUD for gallery_photos
│   └── r2.ts                                # R2 client (S3-compatible SDK)
├── app/
│   ├── api/pozivnica/[slug]/galerija/
│   │   ├── upload/
│   │   │   ├── sign/route.ts                # Generate presigned upload URL
│   │   │   └── confirm/route.ts             # Save metadata after upload
│   │   ├── photos/route.ts                  # GET: list photos (paginated)
│   │   └── photos/[id]/route.ts             # DELETE: remove photo + R2 object
│   └── pozivnica/[slug]/galerija/
│       ├── page.tsx                          # Server page: load photos + theme
│       ├── GalerijaClient.tsx                # Gallery grid + lightbox + upload form
│       └── actions.ts                        # Server actions: delete, approve
```

### Modified Files

| File | Change |
|------|--------|
| `src/app/pozivnica/[slug]/types.ts` | Add `paid_for_gallery?: boolean` |
| `src/app/pozivnica/[slug]/InvitationClient.tsx` | Add gallery link (conditional) |
| `src/app/pozivnica/[slug]/translations.ts` | Add gallery-related translation keys |
| `src/app/api/admin/couples/[slug]/route.ts` | Add `deleteGallery(slug)` to cascade delete |
| `src/middleware.ts` | No change needed (gallery is public for guests) |
| `src/app/admin/nova/page.tsx` | Add `paid_for_gallery` to template |

### New Dependency

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Only the S3-compatible SDK pieces (~lightweight, tree-shakeable). R2 uses S3 API.

---

## Implementation Plan (ordered steps)

### Phase 1: Infrastructure (R2 + data layer)

**Step 1: R2 Setup**
- Create Cloudflare account + R2 bucket `halouspomene-gallery`
- Generate API tokens
- Configure CORS for `halouspomene.rs`
- Enable public access (custom domain or R2.dev)
- Add env vars to `.env.local` and Vercel

**Step 2: Create `src/lib/r2.ts`**
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 600 }); // 10 min
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
```

**Step 3: Create `src/lib/gallery.ts`**
- MongoDB CRUD for `gallery_photos` collection
- Functions: `getPhotos(slug)`, `addPhoto(slug, data)`, `deletePhoto(id)`, `deleteGalleryBySlug(slug)`
- Follow exact pattern from `rsvp.ts`

### Phase 2: API Routes

**Step 4: Presigned URL endpoint**
- `POST /api/pozivnica/[slug]/galerija/upload/sign`
- Validates: slug exists, `paid_for_gallery` is true
- Generates unique key: `{slug}/{timestamp}-{random}.{ext}`
- Returns: `{ presignedUrl, key, publicUrl }`

**Step 5: Upload confirmation endpoint**
- `POST /api/pozivnica/[slug]/galerija/upload/confirm`
- Receives: `{ key, guestName, caption, fileSize, mimeType }`
- Saves metadata to MongoDB `gallery_photos`
- Returns: `{ success: true, photoId }`

**Step 6: Photos list endpoint**
- `GET /api/pozivnica/[slug]/galerija/photos`
- Returns paginated list of approved photos
- Query params: `?page=1&limit=50`

**Step 7: Delete endpoint**
- `DELETE /api/pozivnica/[slug]/galerija/photos/[id]`
- Requires couple auth (JWT)
- Deletes from MongoDB + R2

### Phase 3: UI

**Step 8: Gallery page (`galerija/page.tsx`)**
- Server component: loads initial photos + theme CSS vars
- Passes to `GalerijaClient`
- Gated by `paid_for_gallery` (returns 404 if false)

**Step 9: `GalerijaClient.tsx`** (the main component)

UI sections:
```
┌──────────────────────────────────┐
│  Ana & Dejan                     │  ← couple names (script font)
│  ♥ Naša galerija                 │  ← "Our Gallery"
│                                  │
│  [📸 Dodaj fotografiju]          │  ← upload button
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │        │  ← masonry/grid layout
│  │ img │ │ img │ │ img │        │
│  │     │ │     │ │     │        │
│  └─────┘ └─────┘ └─────┘       │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │        │
│  │ img │ │ img │ │ img │        │
│  └─────┘ └─────┘ └─────┘       │
│                                  │
│  [Učitaj još...]                 │  ← load more (pagination)
│                                  │
│  152 fotografija · 34 gosta      │  ← stats footer
└──────────────────────────────────┘
```

Sub-components within `GalerijaClient.tsx`:
- **Upload modal**: name input, file picker (multi-select), optional caption, progress bar
- **Photo grid**: responsive columns (2 on mobile, 3 on tablet, 4 on desktop)
- **Lightbox**: full-screen photo viewer with swipe, guest name + caption overlay
- **Stats**: photo count, unique uploader count

**Step 10: Upload flow in client**

```typescript
async function handleUpload(files: File[]) {
  for (const file of files) {
    // 1. Get presigned URL from our API
    const { presignedUrl, key, publicUrl } = await fetch(
      `/api/pozivnica/${slug}/galerija/upload/sign`,
      { method: "POST", body: JSON.stringify({ fileName: file.name, fileType: file.type }) }
    ).then(r => r.json());

    // 2. Upload directly to R2
    await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // 3. Confirm upload (save metadata)
    await fetch(`/api/pozivnica/${slug}/galerija/upload/confirm`, {
      method: "POST",
      body: JSON.stringify({ key, guestName, caption, fileSize: file.size, mimeType: file.type }),
    });
  }
}
```

### Phase 4: Integration

**Step 11: Add gallery link to invitation**

In `InvitationClient.tsx`, after RSVP section:
```tsx
{data.paid_for_gallery && (
  <Link href={`/pozivnica/${slug}/galerija`}>
    📸 {t.sharePhotos}  // "Podelite vaše fotografije"
  </Link>
)}
```

**Step 12: Update cascade delete**

In `api/admin/couples/[slug]/route.ts` DELETE handler:
```typescript
await Promise.all([
  deleteCouple(slug),
  deleteRSVPResponses(slug),
  deleteSeatingLayout(slug),
  deleteGalleryBySlug(slug),  // NEW: delete metadata
  // TODO: also delete R2 objects for this slug (list + batch delete)
]);
```

**Step 13: Add translation keys**

```typescript
sharePhotos: "Podelite vaše fotografije"
ourGallery: "Naša galerija"
addPhoto: "Dodaj fotografiju"
yourName: "Vaše ime"
photoCaption: "Opis fotografije (opciono)"
uploading: "Otpremanje..."
uploadSuccess: "Fotografija je dodata!"
loadMore: "Učitaj još"
```

---

## Constraints & Limits

| Constraint | Value | Reason |
|-----------|-------|--------|
| Max file size | 10 MB per photo | Reasonable for phone photos |
| Allowed types | JPEG, PNG, WebP, HEIC | Common phone formats |
| Max uploads per session | 20 photos | Prevent abuse |
| Auto-approve | Yes (default) | Couples can delete unwanted later |
| Gallery expiry | 1 year after wedding | R2 lifecycle rule, cost control |

---

## Complexity & Effort

| Aspect | Estimate |
|--------|----------|
| New files | ~8 |
| Modified files | ~5 |
| Lines of code | ~800-1000 |
| New dependencies | 2 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner) |
| External setup | Cloudflare R2 bucket + API token |
| Effort | Medium-High (2-3 sessions) |

## Risks

- **HEIC support**: iPhones shoot HEIC by default. Browser `<input accept>` can handle it, but display requires conversion. Consider converting to JPEG on upload via canvas API, or accept HEIC and rely on browser support.
- **R2 CORS**: Must be configured correctly for presigned uploads from browser. Test cross-origin PUT requests.
- **Large galleries**: 500+ photos need virtual scrolling or pagination. Start with pagination (simpler).
- **Thumbnail generation**: R2 doesn't auto-resize. Options: (a) use Cloudflare Image Resizing (paid), (b) resize client-side before upload via canvas, (c) use `<img>` with CSS `object-fit` and lazy loading (simplest, good enough).

---

## Revenue Potential

- **High demand**: every couple wants wedding photos in one place
- **Zero marginal cost**: R2 free tier covers most weddings
- **Natural upsell**: "You already have the invitation, add the gallery for X"
- **Viral loop**: guests visit gallery → see halouspomene.rs branding → future couples discover the service
- **Pairs with audio guest book**: "Photos + voice messages = complete memory package"
