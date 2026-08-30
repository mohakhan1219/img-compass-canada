# Screenshots pack

Final V2 product gallery, captured from the live AWS demo as fictional **Dr. Alex Morgan**. No real emails, photos, AWS account IDs, or other products’ identifiers.

Technical AWS proof lives separately in [`docs/evidence/aws-2026-08-30/`](../evidence/aws-2026-08-30/). Do not mix those into this gallery.

| File | Screen |
| --- | --- |
| `01-entry.png` | Entry — Continue as Dr. Alex Morgan |
| `02-dashboard-top.png` | Dashboard hero, Daily Compass, Journey Progress |
| `03-dashboard-progress.png` | Residency Pathway Progress graph |
| `04-program-explorer.png` | Program Explorer with Ontario faculties |
| `05-profile-credentials.png` | Credentials status tracking |
| `06-provincial-pathway.png` | Provincial pathways (Ontario) |
| `07-carms-applications.png` | CaRMS pipeline / applications hub |
| `08-interviews-ranking.png` | Rank order |
| `09-match.png` | Match day (awaiting result) |
| `10-about.png` | IMG-focused About |

Regenerate from the live demo (page content only, 1440×900):

```bash
COMPASS_SHOT_BASE=http://img-compass-prod-demo-1496842689.ca-central-1.elb.amazonaws.com \
  node scripts/capture-screenshots.mjs
```

Requires Chrome (`CHROME_PATH` if not `/usr/local/bin/google-chrome`) and `puppeteer-core`.
