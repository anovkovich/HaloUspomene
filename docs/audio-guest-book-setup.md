# Audio Guest Book — Setup & Remaining Steps

## What Was Built

A digital audio guest book feature where wedding guests record voice messages via browser. The couple gets a private, password-protected playback page to listen and download all recordings.

---

## Pages & How They Work

### 1. Recording Page (Public — Guest-Facing)
**URL:** `/pozivnica/[slug]/audio-knjiga/`

- **No login required** — guests just visit the page
- **Wedding-day gated** — recording only works on the event day + the day after. Before that, guests see "Audio knjiga utisaka bice dostupna na dan vencanja"
- **Recording flow:** Tap mic button → allow microphone → record up to 60s with waveform + countdown → preview → enter name → send
- **Demo mode (unpaid couples):** Shows 2 sample messages with playback. Record button shows upgrade modal instead of recording

### 2. Playback Page (Protected — Couple Only)
**URL:** `/pozivnica/[slug]/audio-knjiga/slusaj/`

- **Password-protected** — same login as potvrde/raspored (redirects to `/prijava`)
- Shows all audio messages: guest name, duration, timestamp
- Play/pause each message individually
- Delete individual messages (removes blob from Vercel + MongoDB entry)
- **"Download all"** button — merges all messages into a single WAV file with 1.5s gaps (client-side Web Audio API)
- **QR code** — auto-generated for the recording page URL, for printing/display at the venue

### 3. Portal Integration
**URL:** `/pozivnica/[slug]/portal/`

- "Audio poruke" button in the toolbar links to the playback page
- **Only visible when `paid_for_audio` is true**

### 4. Invitation Page Button
**URL:** `/pozivnica/[slug]/`

- Mic icon + "Audio knjiga utisaka" link appears **only on the wedding day** and **only when `paid_for_audio` is true**
- Positioned below the seating link, above the footer

### 5. Admin Panel
**URL:** `/admin`

- **Audio toggle** next to the existing Raspored toggle — flips `paid_for_audio` on/off
- **Audio message count** displayed in stats when there are messages
- **Cascade delete** — deleting a couple also deletes all their audio blobs from Vercel Blob and metadata from MongoDB

---

## Remaining Steps Before Production

### 1. Vercel Blob Storage Setup (Required)
1. Go to Vercel Dashboard → your project → Storage → Create → Blob Store
2. Connect it to the project
3. This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables
4. **Without this, audio uploads will fail in production**

### 2. Demo Audio Files (Optional but Recommended)
Replace the empty placeholder files with real audio:
```
public/audio/demo/demo-message-1.webm  (~15s congratulatory message)
public/audio/demo/demo-message-2.webm  (~20s congratulatory message)
```
These play in demo mode for unpaid couples. Record two short sample messages and convert to WebM format. Without real files, demo mode will show the messages but playback will fail silently.

### 3. MongoDB Index (Recommended)
Create an index on the `audio_messages` collection for performance:
```js
db.audio_messages.createIndex({ slug: 1, createdAt: 1 })
```

---

## How to Enable for a Couple

1. Go to `/admin`
2. Find the couple → toggle the "Audio" switch to green
3. That's it — the recording page is live at `/pozivnica/[slug]/audio-knjiga/`
4. On the wedding day, guests will also see a link on the main invitation page

## Technical Details

- **Storage:** Vercel Blob (files stored as `audio/[slug]/[timestamp].webm`)
- **Database:** MongoDB `audio_messages` collection (slug, guestName, blobUrl, blobPathname, durationMs, createdAt)
- **Upload limit:** 2MB per file, 100 recordings per couple
- **Recording format:** WebM/Opus (browser native)
- **Export format:** WAV (merged client-side)
- **Auth:** Same couple auth cookie as potvrde/raspored (`auth_[slug]`)
