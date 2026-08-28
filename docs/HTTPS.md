# HTTPS for the existing AWS demo

The live URL is the default ALB hostname (`*.ca-central-1.elb.amazonaws.com`). Browsers show **Not secure** because that hostname cannot receive a trusted public certificate.

**ACM cannot issue a certificate for `*.elb.amazonaws.com`.** A custom domain you control is required before HTTPS can be turned on.

HTTPS is not possible on the default ALB hostname. A custom domain is required. ACM public certificates are free. Nothing below has been purchased or applied.

## Direct answers

| Question | Answer |
| --- | --- |
| Domain setup | Register (or reuse) a domain. Create a public hosted zone (or use your existing DNS). Request an ACM certificate in **ca-central-1**. Validate it (DNS preferred). Point an A/ALIAS (Route 53) or CNAME at the existing ALB DNS name. |
| Approximate annual domain cost | About **USD 12–20/year** for a typical `.com` / `.ca` at Route 53 or another registrar. Hosted-zone + query fees are a few cents to ~USD 0.50/month — not a material compute increase. |
| Does ACM itself cost anything? | **No.** Public ACM certificates are free. You pay only for the domain and DNS. |
| Can the existing ALB just add an HTTPS listener? | **Yes.** Terraform already has `enable_https` and `acm_certificate_arn`. That adds a **:443** listener on the **same ALB**, forwards to the existing target group, and redirects HTTP :80 → HTTPS. ECS sets `COMPASS_COOKIE_SECURE=true`. No second ALB, no NAT, no CloudFront. |

## Lowest-cost path

1. Domain (~USD 12–20/year).
2. ACM public cert in **ca-central-1** (free), DNS-validated.
3. DNS A/ALIAS or CNAME → existing ALB.
4. `enable_https = true` + `acm_certificate_arn` in Terraform, then apply.

## Not implemented

`enable_https` remains `false`. The demo stays HTTP until a custom domain and ACM certificate are wired.
