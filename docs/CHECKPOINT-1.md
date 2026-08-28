# Checkpoint 1 notes (A–D)

Internal review notes. Not a public release.

## Storage (not a hosted database)

Checkpoint 1 uses `localStorage` key `img-compass-canada.v1`. There is **no** Postgres/Supabase/RDS schema yet. Step G may introduce persistence; V1 must not reuse any private production project IDs.

Shape of `AppState` (see `src/lib/types.ts`):

- `profile` — display name, graduation year, school country, exam window, timezone, notes
- `catalogs` — synthetic qbank/cases metadata
- `sessions` — study logs with raw vs credited minutes and safety flags
- `reviews` — interval cards (1/7/21)
- `stageProgress` — journey map status

## Design decisions

- Nested repository under a private workspace folder so this product has **independent git history**
- Demo auth only (no email collection)
- Journey shells for E–F so the product story is visible without implementing those modules
- Readiness refuses a numeric score without enough recent evidence
- Catalog names are original (“Compass Core Qbank (demo)”)

Azure remains Phase 2. No AI APIs.
