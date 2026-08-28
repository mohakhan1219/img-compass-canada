terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "ca-central-1"
}

variable "github_org" {
  type        = string
  description = "GitHub org or user that will own the public repo (create the repo first)."
}

variable "github_repo" {
  type        = string
  description = "Repository name only, for example img-compass-canada."
}

variable "name_prefix" {
  type    = string
  default = "img-compass"
}

data "aws_caller_identity" "current" {}

data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    data.tls_certificate.github.certificates[length(data.tls_certificate.github.certificates) - 1].sha1_fingerprint
  ]
}

data "aws_iam_policy_document" "trust_prod" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:environment:prod-demo"]
    }
  }
}

data "aws_iam_policy_document" "trust_staging" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:environment:staging"]
    }
  }
}

resource "aws_iam_role" "gha_prod" {
  name               = "${var.name_prefix}-gha-prod-demo"
  assume_role_policy = data.aws_iam_policy_document.trust_prod.json
}

resource "aws_iam_role" "gha_staging" {
  name               = "${var.name_prefix}-gha-staging"
  assume_role_policy = data.aws_iam_policy_document.trust_staging.json
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid = "EcrPush"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
    ]
    resources = ["*"]
  }
  statement {
    sid = "EcsDeploy"
    actions = [
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
      "ecs:UpdateService",
    ]
    resources = ["*"]
  }
  statement {
    sid       = "PassTaskRoles"
    actions   = ["iam:PassRole"]
    resources = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.name_prefix}-*"]
  }
}

resource "aws_iam_role_policy" "gha_prod" {
  name   = "deploy"
  role   = aws_iam_role.gha_prod.id
  policy = data.aws_iam_policy_document.deploy.json
}

resource "aws_iam_role_policy" "gha_staging" {
  name   = "deploy"
  role   = aws_iam_role.gha_staging.id
  policy = data.aws_iam_policy_document.deploy.json
}

output "prod_role_arn" {
  value = aws_iam_role.gha_prod.arn
}

output "staging_role_arn" {
  value = aws_iam_role.gha_staging.arn
}
