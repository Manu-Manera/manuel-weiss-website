'use strict';

// Lightweight client helpers for uploading images to S3 via a presigned URL
// Configure the API endpoint in js/aws-app-config.js (window.AWS_APP_CONFIG.MEDIA_API_BASE)

(function initAwsMediaHelpers() {
  const globalConfig = window.AWS_APP_CONFIG || {};
  const API_BASE = (globalConfig.MEDIA_API_BASE || '').replace(/\/$/, '');

  async function requestPresignedUrl(options) {
    if (!API_BASE) throw new Error('MEDIA_API_BASE not configured');
    const res = await fetch(`${API_BASE}/profile-image/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: options.contentType, userId: options.userId }),
    });
    if (!res.ok) throw new Error(`Presign failed: ${res.status}`);
    return await res.json();
  }

  async function uploadWithPresignedUrl(file, presign) {
    const put = await fetch(presign.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed: ${put.status}`);
    return presign.publicUrl + `?v=${Date.now()}`;
  }

  async function uploadProfileImage(file, userId = 'anonymous') {
    if (!file || !file.type?.startsWith('image/')) throw new Error('Invalid image file');
    const presign = await requestPresignedUrl({ contentType: file.type, userId });
    const publicUrl = await uploadWithPresignedUrl(file, presign);
    return { publicUrl, key: presign.key, bucket: presign.bucket, region: presign.region };
  }

  window.awsMedia = { uploadProfileImage };
})();


