#!/usr/bin/env bash
# API Gateway: /demo-script/catalog und /demo-script/custom/{slug} (CDK-Limit-Umgehung)
set -euo pipefail
REGION="${AWS_REGION:-eu-central-1}"
API_ID="${API_ID:-6i6ysj9c8c}"
ACCOUNT_ID="${ACCOUNT_ID:-038333965110}"
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:website-demo-script-api"

wire_methods() {
  local rid=$1
  local path_suffix=$2
  for METHOD in OPTIONS GET POST; do
    aws apigateway put-method --rest-api-id "$API_ID" --region "$REGION" \
      --resource-id "$rid" --http-method "$METHOD" --authorization-type NONE >/dev/null 2>&1 || true
    aws apigateway put-integration --rest-api-id "$API_ID" --region "$REGION" \
      --resource-id "$rid" --http-method "$METHOD" \
      --type AWS_PROXY --integration-http-method POST \
      --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" >/dev/null
  done
  aws lambda add-permission --function-name website-demo-script-api --region "$REGION" \
    --statement-id "apigw-demo-${path_suffix}-$(date +%s)" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/${path_suffix}" 2>/dev/null || true
}

DEMO_RES=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" \
  --query "items[?path=='/demo-script'].id" --output text)
echo "demo-script resource: $DEMO_RES"

# /catalog
CAT_EXIST=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" \
  --query "items[?path=='/demo-script/catalog'].id" --output text)
if [ -z "$CAT_EXIST" ] || [ "$CAT_EXIST" = "None" ]; then
  CAT_RES=$(aws apigateway create-resource --rest-api-id "$API_ID" --region "$REGION" \
    --parent-id "$DEMO_RES" --path-part catalog --query id --output text)
  echo "created catalog: $CAT_RES"
else
  CAT_RES=$CAT_EXIST
  echo "catalog exists: $CAT_RES"
fi
wire_methods "$CAT_RES" "demo-script/catalog"

# /custom
CUS_PARENT=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" \
  --query "items[?path=='/demo-script/custom'].id" --output text)
if [ -z "$CUS_PARENT" ] || [ "$CUS_PARENT" = "None" ]; then
  CUS_PARENT=$(aws apigateway create-resource --rest-api-id "$API_ID" --region "$REGION" \
    --parent-id "$DEMO_RES" --path-part custom --query id --output text)
  echo "created custom: $CUS_PARENT"
fi

SLUG_EXIST=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" \
  --query "items[?path=='/demo-script/custom/{slug}'].id" --output text)
if [ -z "$SLUG_EXIST" ] || [ "$SLUG_EXIST" = "None" ]; then
  SLUG_RES=$(aws apigateway create-resource --rest-api-id "$API_ID" --region "$REGION" \
    --parent-id "$CUS_PARENT" --path-part '{slug}' --query id --output text)
  echo "created {slug}: $SLUG_RES"
else
  SLUG_RES=$SLUG_EXIST
fi
wire_methods "$SLUG_RES" "demo-script/custom/*"

aws apigateway create-deployment --rest-api-id "$API_ID" --region "$REGION" \
  --stage-name v1 --description "demo-script catalog+custom $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --query id --output text

echo "✅ Routes deployed"
