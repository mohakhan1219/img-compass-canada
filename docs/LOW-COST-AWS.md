# Low-cost AWS options

## Option A — private Fargate + NAT

Fargate in private subnets, `assign_public_ip = false`, egress through a NAT Gateway. RDS private.

- **Security:** Tasks have no public IP. Strong default for a long-lived product.
- **Cost:** NAT is typically the largest monthly line (~USD 30+ plus data) on this demo.
- **Ops:** Matches many corporate diagrams. Enable with `enable_nat = true`.

## Option B — public-subnet Fargate, no NAT (selected)

Fargate in **public** subnets with a **public IP** so it can pull ECR and write CloudWatch/Secrets without NAT. **Inbound tcp/43210 is only allowed from the ALB security group.** RDS stays in **private** subnets, `publicly_accessible = false`, SG allows 5432 from the ECS SG only.

- **Security:** The task ENI is reachable at a public IP **on ports the SG opens**. Today that is only 43210 from the ALB SG, so the internet should not hit the app port directly. RDS is unchanged (not public). This is weaker than fully private tasks if an SG is later opened too wide.
- **Cost:** Drops NAT. Dominant remaining costs are ALB + RDS `db.t4g.micro` + Fargate 0.5/1GB.
- **Ops:** Slightly less “textbook private”, still a real VPC + ALB + RDS design. Default: `enable_nat = false`.

**Recommendation for this portfolio:** **Option B**. Do not place RDS on a public subnet. Revisit Option A if the demo must stay up for months or if a reviewer requires private-only compute.
