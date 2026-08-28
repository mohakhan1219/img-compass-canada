# Screenshots pack

Synthetic captures of the fictional **Dr. Alex Morgan** demo. No real emails, photos, or other products’ IDs.

| File | Screen |
| --- | --- |
| `01-signin.png` | Portfolio sign-in |
| `02-dashboard.png` | Welcome dashboard |
| `03-mccqe1.png` | MCCQE1 performance |
| `04-nac.png` | NAC practice workspace |
| `05-language.png` | Language evidence cards |
| `06-provincial.png` | Provincial pathway explorer |
| `07-carms.png` | CaRMS pipeline |
| `08-pathway-overview.png` | Journey tiles |
| `09-health.png` | Live `/api/health` JSON |
| `10-ready.png` | Live `/api/ready` with Postgres + TLS verified |
| `11-metrics.png` | Live `/api/metrics` JSON |
| `12-profile.png` | IMG profile |
| `13-applications.png` | Applications workspace |
| `14-interviews.png` | Interview preparation |
| `15-ranking.png` | Rank-order list |
| `16-match.png` | Match day awaiting state |

Regenerate (app must be running):

```bash
COMPASS_SHOT_BASE=http://127.0.0.1:43210 node scripts/capture-screenshots.mjs
```

Requires Chrome (`CHROME_PATH` if not `/usr/local/bin/google-chrome`) and `puppeteer-core` on `NODE_PATH`.
