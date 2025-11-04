#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script for the profile media SAM stack
# Requires: AWS CLI and AWS SAM CLI configured (aws configure)

STACK_NAME=${STACK_NAME:-manuel-weiss-profile-media}
REGION=${REGION:-eu-central-1}
BUCKET_NAME=${BUCKET_NAME:-manuel-weiss-public-media}
PROFILE_PREFIX=${PROFILE_PREFIX:-public/profile-images/}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR/infrastructure"

echo "🚀 Building SAM template..."
sam build --template-file profile-media-sam.yaml

echo "🚀 Deploying stack: $STACK_NAME in $REGION ..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides BucketName="$BUCKET_NAME" ProfilePrefix="$PROFILE_PREFIX" \
  --resolve-s3 \
  --no-confirm-changeset

echo "✅ Deployed. Fetching outputs..."
aws cloudformation describe-stacks \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table

echo "ℹ️  Set js/aws-app-config.js MEDIA_API_BASE to the ApiBaseUrl from outputs."



