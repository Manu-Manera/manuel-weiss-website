'use strict';

// Lightweight client helpers for uploading images to S3 via a presigned URL
// Configure the API endpoint in js/aws-app-config.js (window.AWS_APP_CONFIG.MEDIA_API_BASE)

(function initAwsMediaHelpers() {
  const globalConfig = window.AWS_APP_CONFIG || {};
  const API_BASE = (globalConfig.MEDIA_API_BASE || '').replace(/\/$/, '');

  async function requestPresignedUrl(options) {
    if (!API_BASE) {
      throw new Error('API Endpoint nicht konfiguriert. Bitte kontaktieren Sie den Administrator.');
    }
    
    const endpoint = `${API_BASE}/profile-image/upload-url`;
    
    try {
      console.log(`📤 Requesting presigned URL from: ${endpoint}`);
      
      const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: options.contentType, userId: options.userId }),
    });
    
    // Handle 400 Bad Request (oft Quota-Fehler)
    if (res.status === 400) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('❌ API Gateway 400 Error:', errorText);
        
        // Prüfe ob es ein Quota-Fehler ist
        if (errorText.includes('quota') || errorText.includes('Quota') || errorText.includes('exceeded')) {
            const quotaError = new Error('QuotaExceededError: The quota has been exceeded.');
            quotaError.name = 'QuotaExceededError';
            throw quotaError;
        }
        
        throw new Error(`API Gateway Bad Request (400): ${errorText}`);
    }
    
    // Handle 403 Forbidden (Berechtigungsfehler)
    if (res.status === 403) {
        const errorText = await res.text().catch(() => 'Forbidden');
        console.error('❌ API Gateway 403 Forbidden:', errorText);
        throw new Error(`API Gateway Forbidden (403): ${errorText}`);
    }
    
    // Handle 502 Bad Gateway and other server errors
    if (res.status === 502 || res.status === 503 || res.status === 504) {
        const errorMsg = `AWS API Gateway nicht verfügbar (${res.status}). ` +
          `Der Server antwortet nicht. Bitte versuchen Sie es in ein paar Sekunden erneut. ` +
          `Endpoint: ${endpoint}`;
        console.error('❌ API Gateway Error:', errorMsg);
        throw new Error(errorMsg);
    }
    
    if (!res.ok) {
      const errorText = await res.text();
        // Prüfe auf Quota-Fehler
        if (errorText && (errorText.includes('quota') || errorText.includes('Quota') || errorText.includes('exceeded'))) {
            const quotaError = `The quota has been exceeded. ${errorText}`;
            console.error('❌ Quota Error:', quotaError);
            throw new Error(quotaError);
        }
        const errorMsg = `Upload-URL-Anfrage fehlgeschlagen (${res.status}): ${errorText || res.statusText}. ` +
          `Endpoint: ${endpoint}`;
        console.error('❌ Presign Error:', errorMsg);
        throw new Error(errorMsg);
    }
    
      const data = await res.json();
      console.log('✅ Presigned URL erhalten:', data.key);
      return data;
    } catch (error) {
      console.error('❌ Presigned URL request error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Netzwerkfehler: Die Verbindung zum Server konnte nicht hergestellt werden. ` +
          `Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. ` +
          `Endpoint: ${endpoint}`);
      }
      
      throw error;
    }
  }

  async function uploadWithPresignedUrl(file, presign) {
    const put = await fetch(presign.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
      body: file,
    });
    if (!put.ok) {
      const errorText = await put.text();
      console.error('❌ S3 PUT failed:', put.status, errorText);
      throw new Error(`Upload failed: ${put.status} - ${errorText}`);
    }
    
    // WICHTIG: Entferne Query-Parameter von publicUrl (falls vorhanden) und füge Cache-Busting hinzu
    let cleanUrl = presign.publicUrl;
    if (cleanUrl.includes('?')) {
      cleanUrl = cleanUrl.split('?')[0];
    }
    
    // Stelle sicher, dass die URL korrekt ist (ohne doppelte Slashes)
    cleanUrl = cleanUrl.replace(/([^:]\/)\/+/g, '$1');
    
    console.log('✅ S3 Upload erfolgreich, publicUrl:', cleanUrl);
    return cleanUrl + `?v=${Date.now()}`;
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
    
    // Check if API_BASE is configured
    if (!API_BASE) {
      throw new Error('API Endpoint nicht konfiguriert. Bitte kontaktieren Sie den Administrator.');
    }
    
    // WORKAROUND: Use profile-image endpoint with fileType parameter until /document/upload-url is deployed
    // The Lambda function already supports fileType parameter
    const endpoint = `${API_BASE}/profile-image/upload-url`;
    
    try {
      console.log(`📤 Requesting presigned URL from: ${endpoint}`);
      
      const presign = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType: file.type, 
          userId: userId,
          fileType: fileType  // Lambda function will handle this
        }),
      });
      
      // Handle 502 Bad Gateway and other server errors
      if (presign.status === 502 || presign.status === 503 || presign.status === 504) {
        const errorMsg = `AWS API Gateway nicht verfügbar (${presign.status}). ` +
          `Der Server antwortet nicht. Bitte versuchen Sie es in ein paar Sekunden erneut. ` +
          `Endpoint: ${endpoint}`;
        console.error('❌ API Gateway Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!presign.ok) {
        const errorText = await presign.text();
        const errorMsg = `Upload-URL-Anfrage fehlgeschlagen (${presign.status}): ${errorText || presign.statusText}. ` +
          `Endpoint: ${endpoint}`;
        console.error('❌ Presign Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const presignData = await presign.json();
      console.log('✅ Presigned URL erhalten:', presignData.key);
      
      const publicUrl = await uploadWithPresignedUrl(file, presignData);
      console.log('✅ Datei erfolgreich hochgeladen:', publicUrl);
      
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
      console.error('❌ Document upload error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Netzwerkfehler: Die Verbindung zum Server konnte nicht hergestellt werden. ` +
          `Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. ` +
          `Endpoint: ${endpoint}`);
      }
      
      throw error;
    }
  }

  /**
   * Test API endpoint availability
   * @returns {Promise<{available: boolean, message: string, endpoint: string}>}
   */
  async function testEndpoint() {
    if (!API_BASE) {
      return {
        available: false,
        message: 'API Endpoint nicht konfiguriert',
        endpoint: 'N/A'
      };
    }
    
    const endpoint = `${API_BASE}/profile-image/upload-url`;
    
    try {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      const res = await fetch(endpoint, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok || res.status === 200 || res.status === 405) {
        return {
          available: true,
          message: 'Endpoint ist erreichbar',
          endpoint: endpoint
        };
      } else {
        return {
          available: false,
          message: `Endpoint antwortet mit Status ${res.status}`,
          endpoint: endpoint
        };
      }
    } catch (error) {
      return {
        available: false,
        message: `Endpoint nicht erreichbar: ${error.message}`,
        endpoint: endpoint,
        error: error.message
      };
    }
  }

  window.awsMedia = { 
    uploadProfileImage, 
    uploadDocument,
    testEndpoint 
  };
})();


