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

  async function uploadDocument(file, userId = 'anonymous', fileType = 'document') {
    if (!file) throw new Error('Invalid file');
    
    // Validate file type
    const validTypes = ['cv', 'certificate', 'document'];
    if (!validTypes.includes(fileType)) {
      throw new Error(`Invalid fileType. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // WORKAROUND: Use profile-image endpoint with fileType parameter until /document/upload-url is deployed
    // The Lambda function already supports fileType parameter
    const endpoint = `${API_BASE}/profile-image/upload-url`;
    
    try {
      const presign = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType: file.type, 
          userId: userId,
          fileType: fileType  // Lambda function will handle this
        }),
      });
      
      if (!presign.ok) {
        const errorText = await presign.text();
        throw new Error(`Presign failed: ${presign.status} - ${errorText}`);
      }
      
      const presignData = await presign.json();
      
      const publicUrl = await uploadWithPresignedUrl(file, presignData);
      return { 
        publicUrl, 
        key: presignData.key, 
        bucket: presignData.bucket, 
        region: presignData.region,
        fileType: fileType,
        fileName: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  window.awsMedia = { uploadProfileImage, uploadDocument };
})();


