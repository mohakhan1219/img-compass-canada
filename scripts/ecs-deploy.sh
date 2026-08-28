#!/usr/bin/env bash
# Registers a new ECS task definition revision with IMAGE and updates the service.
# Rollback: pass a previous image digest/tag or previous task definition ARN.
# Does not change container command: production remains image CMD (migrate + server.js).
set -euo pipefail

: "${AWS_REGION:?}"
: "${ECS_CLUSTER:?}"
: "${ECS_SERVICE:?}"
: "${IMAGE:?}"

CURRENT=$(aws ecs describe-services --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE" --query 'services[0].taskDefinition' --output text)
FAMILY=$(aws ecs describe-task-definition --task-definition "$CURRENT" --query 'taskDefinition.family' --output text)

aws ecs describe-task-definition --task-definition "$CURRENT" --query 'taskDefinition' --output json > /tmp/td.json
python3 - "$IMAGE" <<'PY'
import json, sys
image = sys.argv[1]
with open("/tmp/td.json") as f:
    d = json.load(f)
keep = ["family", "networkMode", "containerDefinitions", "requiresCompatibilities", "cpu", "memory", "executionRoleArn", "taskRoleArn"]
out = {k: d[k] for k in keep if k in d}
out["containerDefinitions"][0]["image"] = image
with open("/tmp/td-new.json", "w") as f:
    json.dump(out, f)
PY

ARN=$(aws ecs register-task-definition --cli-input-json file:///tmp/td-new.json --query 'taskDefinition.taskDefinitionArn' --output text)
aws ecs update-service --cluster "$ECS_CLUSTER" --service "$ECS_SERVICE" --task-definition "$ARN" --force-new-deployment >/dev/null
echo "deployed $ARN"
echo "rollback_from_previous $CURRENT"
