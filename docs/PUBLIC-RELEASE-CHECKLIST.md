# Public release checklist

LinkedIn stays **off** until the owner posts. AWS destroy stays **owner-gated**.

## Published with this tree

- [x] New public Git history (not a private study-app clone; local commits that contained an AWS account ID are not pushed)
- [x] No secrets, `.env`, AWS account IDs, or personal photos in the published tree
- [x] README, LICENSE, NOTICE, CHANGELOG present
- [x] Quiet **Demo data** chips (red reserved for real blockers)
- [x] Screenshot pack (synthetic Dr. Alex Morgan)
- [x] Prod-demo URL labelled as a synthetic HTTP demo
- [x] AWS prod-demo applied and TLS-verified (`docs/AWS-DEPLOYMENT-EVIDENCE.md`)

## Still owner-gated

- [ ] GitHub Environments + OIDC (`docs/GITHUB-OIDC.md`)
- [ ] Dependabot after the public remote exists
- [ ] HTTPS / custom domain (`docs/HTTPS.md`)
- [ ] LinkedIn post after owner review of the public URL
- [ ] Park or destroy AWS when the live demo is no longer needed (`docs/OPERATIONS-LIFECYCLE.md`)
