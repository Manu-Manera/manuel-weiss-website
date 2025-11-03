'use strict';

// Central app config for AWS media/API endpoints
// Adjust MEDIA_API_BASE to your API Gateway base URL (without trailing slash)

window.AWS_APP_CONFIG = Object.assign({}, window.AWS_APP_CONFIG || {}, {
  MEDIA_API_BASE: 'https://YOUR_API.execute-api.eu-central-1.amazonaws.com/prod',
});


