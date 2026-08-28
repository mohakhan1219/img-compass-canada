# Amazon RDS CA bundle (ca-central-1)

File: `rds-ca-ca-central-1-bundle.pem`

Source (official AWS trust store, fetched 28 Aug 2026):

https://truststore.pki.rds.amazonaws.com/ca-central-1/ca-central-1-bundle.pem

This is a public CA bundle, not a private key. The Node PostgreSQL client uses it with `rejectUnauthorized: true` so RDS TLS is verified. Do not disable certificate validation.

To refresh:

```bash
curl -fsSL -o certs/rds-ca-ca-central-1-bundle.pem \
  https://truststore.pki.rds.amazonaws.com/ca-central-1/ca-central-1-bundle.pem
```
