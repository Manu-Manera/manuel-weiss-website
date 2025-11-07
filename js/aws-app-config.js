'use strict';

// Central app config for AWS media/API endpoints
// Adjust MEDIA_API_BASE to your API Gateway base URL (without trailing slash)
//
// Nach dem Deployment des Media-Stacks (deploy/deploy-profile-media.sh):
// 1. Führe aus: aws cloudformation describe-stacks --stack-name manuel-weiss-profile-media --region eu-central-1 --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text
// 2. Trage die ausgegebene URL hier ein (z.B. https://abc123.execute-api.eu-central-1.amazonaws.com/prod)

window.AWS_APP_CONFIG = Object.assign({}, window.AWS_APP_CONFIG || {}, {
  // Media API Base URL (nach Deployment gesetzt)
  MEDIA_API_BASE: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod',
  
  // AWS Region für S3
  REGION: 'eu-central-1',
  
  // S3 Bucket Name (wird vom Stack erstellt)
  S3_PROFILE_BUCKET_NAME: 'manuel-weiss-public-media',
  
  // Prefix für Profilbilder im S3 Bucket
  S3_PROFILE_PREFIX: 'public/profile-images/',
});


