#!/usr/bin/env bash
set -euo pipefail

REST_API_ID="of2iwj7h2c"
REGION="eu-central-1"
STAGE="prod"
ACCOUNT_ID="038333965110"
TABLE="mawps-user-profiles"
ROLE_NAME="apigateway-dynamodb-profiles"

echo "🔧 IAM-Rolle für DynamoDB-Integration …"
TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "apigateway.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'
aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST_POLICY" 2>/dev/null || true

POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:UpdateItem"],
    "Resource": "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE}"
  }]
}
EOF
)
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name dynamodb-profiles-access --policy-document "$POLICY_DOC"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

ROOT_ID=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --region "$REGION" --query "items[?path=='/'].id" --output text)
USER_ID_RESOURCE=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --region "$REGION" --query "items[?path=='/admin/users/{userId}'].id" --output text)

echo "📁 /user/access anlegen …"
USER_RESOURCE=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --region "$REGION" --query "items[?path=='/user'].id" --output text 2>/dev/null || true)
if [ -z "$USER_RESOURCE" ] || [ "$USER_RESOURCE" = "None" ]; then
  USER_RESOURCE=$(aws apigateway create-resource --rest-api-id "$REST_API_ID" --parent-id "$ROOT_ID" --path-part user --region "$REGION" --query id --output text)
fi
USER_ACCESS_RESOURCE=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --region "$REGION" --query "items[?path=='/user/access'].id" --output text 2>/dev/null || true)
if [ -z "$USER_ACCESS_RESOURCE" ] || [ "$USER_ACCESS_RESOURCE" = "None" ]; then
  USER_ACCESS_RESOURCE=$(aws apigateway create-resource --rest-api-id "$REST_API_ID" --parent-id "$USER_RESOURCE" --path-part access --region "$REGION" --query id --output text)
fi

aws apigateway put-method --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method GET --authorization-type NONE --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-method --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method OPTIONS --authorization-type NONE --region "$REGION" >/dev/null 2>&1 || true

aws apigateway put-integration --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method GET \
  --type AWS --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:dynamodb:action/GetItem" \
  --credentials "$ROLE_ARN" \
  --request-templates '{"application/json":"{\"TableName\":\"'"$TABLE"'\",\"Key\":{\"userId\":{\"S\":\"$input.params('"'"'userId'"'"')\"}}}"}' \
  --region "$REGION" >/dev/null

aws apigateway put-method-response --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method GET --status-code 200 \
  --response-parameters method.response.header.Access-Control-Allow-Origin=false --region "$REGION" >/dev/null 2>&1 || true

aws apigateway put-integration-response --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method GET --status-code 200 \
  --response-templates '{"application/json":"#set($item = $input.path('"'"'$.Item'"'"'))\n#set($enabled = false)\n#if($item && !$item.isEmpty())\n  #set($access = $item.get('"'"'access'"'"'))\n  #if($access && $access.M && $access.M.features && $access.M.features.M && $access.M.features.M.personality_song)\n    #set($enabled = $access.M.features.M.personality_song.BOOL)\n  #end\n#end\n{\"success\":true,\"features\":{\"personality_song\":$enabled}}"}' \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region "$REGION" >/dev/null 2>&1 || true

aws apigateway put-integration --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method OPTIONS \
  --type MOCK --request-templates '{"application/json":"{\"statusCode\":200}"}' --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-method-response --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method OPTIONS --status-code 200 \
  --response-parameters method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false \
  --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-integration-response --rest-api-id "$REST_API_ID" --resource-id "$USER_ACCESS_RESOURCE" --http-method OPTIONS --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --response-templates '{"application/json":""}' --region "$REGION" >/dev/null 2>&1 || true

echo "📁 /admin/users/{userId}/access anlegen …"
ADMIN_ACCESS_RESOURCE=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --region "$REGION" --query "items[?path=='/admin/users/{userId}/access'].id" --output text 2>/dev/null || true)
if [ -z "$ADMIN_ACCESS_RESOURCE" ] || [ "$ADMIN_ACCESS_RESOURCE" = "None" ]; then
  ADMIN_ACCESS_RESOURCE=$(aws apigateway create-resource --rest-api-id "$REST_API_ID" --parent-id "$USER_ID_RESOURCE" --path-part access --region "$REGION" --query id --output text)
fi

aws apigateway put-method --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method PUT --authorization-type NONE --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-method --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method OPTIONS --authorization-type NONE --region "$REGION" >/dev/null 2>&1 || true

PUT_TEMPLATE='{"TableName":"'"$TABLE"'","Key":{"userId":{"S":"$input.params('"'"'userId'"'"')"}},"UpdateExpression":"SET #access = :access, #updatedAt = :updatedAt","ExpressionAttributeNames":{"#access":"access","#updatedAt":"updatedAt"},"ExpressionAttributeValues":{":access":{"M":{"features":{"M":{"personality_song":{"BOOL":$util.parseJson($input.body).personality_song}}},"updatedAt":{"S":"$context.requestTime"},"updatedBy":{"S":"admin-api"}}},":updatedAt":{"S":"$context.requestTime"}}}'

aws apigateway put-integration --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method PUT \
  --type AWS --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:dynamodb:action/UpdateItem" \
  --credentials "$ROLE_ARN" \
  --request-templates "{\"application/json\":\"$PUT_TEMPLATE\"}" \
  --region "$REGION" >/dev/null

aws apigateway put-method-response --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method PUT --status-code 200 --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-integration-response --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method PUT --status-code 200 \
  --response-templates '{"application/json":"{\"success\":true}"}' \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region "$REGION" >/dev/null 2>&1 || true

aws apigateway put-integration --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method OPTIONS \
  --type MOCK --request-templates '{"application/json":"{\"statusCode\":200}"}' --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-method-response --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method OPTIONS --status-code 200 \
  --response-parameters method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false \
  --region "$REGION" >/dev/null 2>&1 || true
aws apigateway put-integration-response --rest-api-id "$REST_API_ID" --resource-id "$ADMIN_ACCESS_RESOURCE" --http-method OPTIONS --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'PUT,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --response-templates '{"application/json":""}' --region "$REGION" >/dev/null 2>&1 || true

echo "🚀 Deploy Stage ${STAGE} …"
aws apigateway create-deployment --rest-api-id "$REST_API_ID" --stage-name "$STAGE" --region "$REGION" >/dev/null

echo "✅ Access-Routen bereit:"
echo "   GET  https://${REST_API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}/user/access?userId=EMAIL"
echo "   PUT  https://${REST_API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}/admin/users/{userId}/access"
