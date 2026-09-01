# MongoDB Backup Plan — HaloUspomene

**Status:** Workflow committed, awaiting setup of secrets + Atlas allowlist before first run.
**Created:** 2026-05-05

## Context

Atlas tier is **M0 (free)** which provides **no native snapshots**. This GitHub Actions workflow is the project's only backup. If it fails silently, there is no fallback.

## What's already built and pushed

- `.github/workflows/db-backup.yml` — runs nightly at 01:00 UTC (= 03:00 Belgrade summer / 02:00 winter)
- Dumps full `halouspomene` DB via `mongodump --gzip --archive`
- Uploads gzipped BSON archive as a GitHub Release asset (tag: `backup-YYYY-MM-DD`)
- Prunes old releases per retention policy (see below)
- Sends Gmail failure email to `halouspomene@gmail.com` if any step fails
- Manual trigger available via Actions → "Daily MongoDB Backup" → "Run workflow"

## Setup checklist — TODO before workflow can run

### 1. Atlas IP allowlist
- [ ] Atlas dashboard → Network Access → confirm `0.0.0.0/0` is allowed
- Reason: GitHub Actions runner IPs rotate, no way to whitelist specific ranges on M0

### 2. Atlas user permissions
- [ ] Audit `halouspomene_db_user` permissions in Atlas → Database Access
- For backup, `readAnyDatabase` on `halouspomene` is sufficient. Currently this user is also used by Vercel app for read+write — keep as is, or create a separate read-only user dedicated to backups (cleaner but extra setup).

### 3. Gmail App Password
- [ ] Enable 2FA on `halouspomene@gmail.com` if not already (https://myaccount.google.com/security)
- [ ] Generate App Password at https://myaccount.google.com/apppasswords (label: "GitHub Actions Backup")
- [ ] Save the 16-char string for the next step (visible only once)

### 4. GitHub Secrets
On https://github.com/anovkovich/HaloUspomene/settings/secrets/actions add:
- [ ] `MONGODB_URI` — full connection string (paste from Vercel env var, starts with `mongodb+srv://...`)
- [ ] `GMAIL_APP_PASSWORD` — the 16-char App Password from step 3

`GITHUB_TOKEN` is automatic — do not add.

### 5. Repo workflow permissions
- [ ] Settings → Actions → General → Workflow permissions → "Read and write permissions"
- Reason: `gh release create` needs write access (default is read-only)

### 6. First test run
- [ ] Actions tab → "Daily MongoDB Backup" → "Run workflow" button (manual dispatch)
- [ ] Verify success: check Releases tab for `backup-YYYY-MM-DD` with attached `.archive.gz` (~50KB-1MB expected at current DB size)
- [ ] If fails: read the run logs; common causes listed in workflow comment block

### 7. Failure-notification test (optional but recommended)
- [ ] Temporarily change `MONGODB_URI` secret to break it (append `XXX` to password)
- [ ] Manually trigger workflow → expect failure
- [ ] Verify email arrived at halouspomene@gmail.com
- [ ] Restore correct `MONGODB_URI`

## How it works

```
┌─────────────────┐   nightly cron    ┌──────────────────┐
│ GitHub Actions  │ ────────────────▶ │ MongoDB Atlas    │
│ Linux runner    │   mongodump        │ halouspomene     │
└────────┬────────┘                    └──────────────────┘
         │  bson + gzip
         ▼
┌─────────────────┐
│ GitHub Release  │  ← versioned, browseable, free retention
│ asset (.gz)     │
└─────────────────┘
```

**Cron:** `0 1 * * *` — daily at 01:00 UTC. GitHub doesn't honor DST, so Belgrade time shifts ±1h between summer and winter.

## Retention policy

| Period | Kept |
|---|---|
| Last 30 days | Every daily backup |
| Last 12 months | First-of-month backups |
| Forever | First-of-January backups (yearly) |

Implemented inline in the "Prune old releases" workflow step. Approx. ~50 release assets total, each a few MB → trivial for GitHub free.

## Restore procedure

```bash
# 1. List backups
gh release list --limit 20

# 2. Download specific backup
gh release download backup-2026-05-04 --pattern "*.archive.gz"

# 3. Restore (full overwrite — drops existing collections first)
mongorestore --uri "<TARGET_URI>" --gzip --archive=halouspomene-2026-05-04.archive.gz --drop

# Selective restore (single collection, no drop):
# mongorestore --uri "<TARGET_URI>" --gzip --archive=halouspomene-2026-05-04.archive.gz \
#   --nsInclude=halouspomene.couples
```

**Warning:** `--drop` replaces collections wholesale. For point-in-time recovery use a scratch cluster first, inspect, then sync needed records.

## What's NOT backed up

Documented as known gaps, may revisit later:

1. **Vercel Blob storage** — audio guest book recordings, premium AI illustrations, custom uploads. The `audio_messages` collection holds blob URLs but the actual files live in Vercel Blob and are not mirrored anywhere. If Vercel Blob loses a file, the URL exists in the backup but the audio is gone.
2. **Sentry events / replays** — operational telemetry, not customer data; OK to lose
3. **Vercel deployment history / build artifacts** — recoverable from git
4. **Encrypted backups** — user opted to skip GPG encryption for MVP. Repo is private, so backup access requires GitHub auth. Acceptable risk for now.

## Open questions / decisions to revisit

1. **Off-site copy** — currently single-point-of-failure: if GitHub disables our account or repo, backups are gone. Could mirror to S3/Cloudflare R2 (~$0/mo at this scale). Defer until ~100+ paying customers.
2. **Encryption** — see above. If we ever store more sensitive data (eg payment cards), add GPG encryption to backup archive. Setup involves generating a keypair and storing the public key as a secret.
3. **Restore drill cadence** — backups that are never restored from are not real backups. Suggest quarterly: download latest, restore to scratch Atlas cluster (free M0), verify integrity. Schedule reminder in Q3 2026.
4. **Atlas M0 auto-pause** — Atlas pauses M0 clusters after 60 days idle. If the prod DB ever becomes idle (eg seasonal lull), the cluster pauses → workflow fails → email triggers. Vercel deployments and live traffic prevent this in practice.
5. **Workflow auto-disable** — GitHub disables workflows in a repo after 60 days of zero activity. Active deploys keep it alive but worth knowing.
6. **Success-heartbeat email** — currently we only get notified on failure. Silent success could mask "workflow disabled" or "GitHub Actions outage". Could add monthly heartbeat. Defer unless a silent-failure incident occurs.
7. **Atlas tier upgrade** — at ~500+ couples or persistent audio traffic, consider M10 (~$60/mo) for native continuous backup + point-in-time recovery. Then this GH workflow becomes a redundant off-site copy (still valuable).
8. **Backup of `standalone_seatings`** — covered (it's a collection in `halouspomene` DB, mongodump grabs all collections). Just noting for completeness since this is a newer feature.

## File reference

- Workflow: `.github/workflows/db-backup.yml`
- Memory note: `~/.claude/projects/.../memory/project_mongodb.md`
- This plan: `docs/DB_BACKUP_PLAN.md`
