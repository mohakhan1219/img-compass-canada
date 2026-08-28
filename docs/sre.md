# SRE

## SLIs

| SLI | Measurement |
| --- | --- |
| Availability | `/api/health` success from the ALB health check |
| Readiness | `/api/ready` 200 when Postgres answers `select 1` (Postgres mode) |
| Latency | ALB target response time (p95) |
| Deploy success | ECS rolling deploy reaches steady state |

## SLOs (prod-demo, not a paid SLA)

| SLO | Target |
| --- | --- |
| Availability | 99% monthly (best-effort demo) |
| Ready check | 99% of probes succeed when RDS is healthy |
| Change fail | Rollback via previous task definition within 15 minutes |

## Observability

- Structured JSON logs (`src/server/log.ts`) including `requestId`
- `x-request-id` on every response (middleware)
- CloudWatch log group `/ecs/img-compass-{env}`
- Core counters at `/api/metrics` (`http_requests`, `persist_saves`, `persist_errors`)
- ECS Container Insights enabled

## Error budget

Treat the prod-demo as a portfolio environment. Freeze deploys if two consecutive tagged releases require rollback.
