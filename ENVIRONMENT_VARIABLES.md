# Environment Variables - Manuel Weiss Website

Diese Variablen müssen im **Netlify Dashboard** eingetragen werden:
`Site settings → Environment variables`

## AWS Credentials
```
NETLIFY_AWS_ACCESS_KEY_ID=your-aws-access-key-id
NETLIFY_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
NETLIFY_AWS_REGION=eu-central-1
```

## DynamoDB Tables
```
USER_DATA_TABLE=mawps-user-data
API_SETTINGS_TABLE=mawps-api-settings
DYNAMODB_SETTINGS_TABLE=manuel-weiss-settings
```

## S3 Buckets
```
S3_BUCKET=mawps-profile-images
HERO_VIDEO_BUCKET=manuel-weiss-hero-videos
```

## Email (SES)
```
FROM_EMAIL=noreply@manuel-weiss.ch
TO_EMAIL=manuel@manuel-weiss.ch
```

## Security
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_SECRET=your-encryption-secret-key
```

## Cognito (User Auth)
```
USER_POOL_ID=eu-central-1_xxxxxxxx
USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Nach AWS Migration
```
API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1
USE_AWS_API=true
```
