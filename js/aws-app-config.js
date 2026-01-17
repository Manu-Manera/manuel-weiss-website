'use strict';

/**
 * Central AWS App Configuration
 * Nach CDK Deploy wird API_BASE automatisch gesetzt
 * 
 * Deployment:
 * 1. cd infrastructure && npx cdk deploy manuel-weiss-website-api
 * 2. API URL aus Output kopieren und hier eintragen
 */

// API Base URL - wird nach CDK Deploy gesetzt
// Temporär auf Netlify Functions bis Migration abgeschlossen
const USE_AWS_API = false; // Auf true setzen nach CDK Deploy

window.AWS_APP_CONFIG = Object.assign({}, window.AWS_APP_CONFIG || {}, {
  // ========================================
  // API KONFIGURATION
  // ========================================
  
  // Nach CDK Deploy: API Gateway URL eintragen
  // Format: https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1
  API_BASE: USE_AWS_API 
    ? 'https://NACH-CDK-DEPLOY-EINTRAGEN.execute-api.eu-central-1.amazonaws.com/v1'
    : '', // Leer = Netlify Functions als Fallback
  
  // Alle API Endpoints
  ENDPOINTS: {
    // User Data
    USER_DATA: '/user-data',
    USER_PROFILE: '/user-data/profile',
    USER_RESUMES: '/user-data/resumes',
    USER_DOCUMENTS: '/user-data/documents',
    USER_COVER_LETTERS: '/user-data/cover-letters',
    USER_APPLICATIONS: '/user-data/applications',
    USER_PHOTOS: '/user-data/photos',
    USER_WORKFLOWS: '/user-data/workflows',
    
    // CV Tailor
    CV_GENERAL: '/cv-general',
    CV_TARGET: '/cv-target',
    CV_JOB_PARSE: '/cv-job-parse',
    CV_FILES_PARSE: '/cv-files-parse',
    CV_EXPORT: '/cv-export',
    
    // Job Parser
    JOB_PARSER: '/job-parser',
    
    // OpenAI Proxy
    OPENAI_PROXY: '/openai-proxy',
    
    // API Settings
    API_SETTINGS: '/api-settings',
    
    // Hero Video
    HERO_VIDEO_SETTINGS: '/hero-video/settings',
    HERO_VIDEO_UPLOAD: '/hero-video/upload',
    
    // Profile Image Upload
    PROFILE_IMAGE_UPLOAD: '/profile-image/upload-url',
    S3_UPLOAD: '/profile-image/upload-url',
    
    // Snowflake Game
    SNOWFLAKE_HIGHSCORES: '/snowflake-highscores',
    
    // Contact
    CONTACT_EMAIL: '/contact-email'
  },
  
  // ========================================
  // MEDIA KONFIGURATION (bestehend)
  // ========================================
  MEDIA_API_BASE: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod',
  REGION: 'eu-central-1',
  S3_PROFILE_BUCKET_NAME: 'manuel-weiss-public-media',
  S3_PROFILE_PREFIX: 'public/profile-images/',
  
  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  /**
   * Gibt die vollständige URL für einen Endpoint zurück
   * Falls API_BASE gesetzt ist, wird AWS verwendet
   * Sonst Fallback auf Netlify Functions
   */
  getEndpointUrl: function(endpoint) {
    if (this.API_BASE && this.API_BASE.length > 0) {
      // AWS API Gateway
      return this.API_BASE + (this.ENDPOINTS[endpoint] || endpoint);
    } else {
      // Netlify Functions Fallback
      const netlifyMap = {
        'USER_DATA': '/.netlify/functions/user-data',
        'USER_PROFILE': '/.netlify/functions/user-data/profile',
        'USER_RESUMES': '/.netlify/functions/user-data/resumes',
        'USER_DOCUMENTS': '/.netlify/functions/user-data/documents',
        'CV_GENERAL': '/.netlify/functions/cv-general',
        'CV_TARGET': '/.netlify/functions/cv-target',
        'CV_JOB_PARSE': '/.netlify/functions/cv-job-parse',
        'CV_FILES_PARSE': '/.netlify/functions/cv-files-parse',
        'CV_EXPORT': '/.netlify/functions/cv-export',
        'JOB_PARSER': '/.netlify/functions/job-parser',
        'OPENAI_PROXY': '/.netlify/functions/openai-proxy',
        'API_SETTINGS': '/.netlify/functions/api-settings',
        'HERO_VIDEO_SETTINGS': '/.netlify/functions/hero-video-settings',
        'HERO_VIDEO_UPLOAD': '/.netlify/functions/hero-video-upload',
        'PROFILE_IMAGE_UPLOAD': '/.netlify/functions/s3-upload',
        'S3_UPLOAD': '/.netlify/functions/s3-upload',
        'SNOWFLAKE_HIGHSCORES': '/.netlify/functions/snowflake-highscores',
        'CONTACT_EMAIL': '/.netlify/functions/send-contact-email'
      };
      return netlifyMap[endpoint] || `/.netlify/functions/${endpoint.toLowerCase().replace(/_/g, '-')}`;
    }
  }
});

// Alias für einfacheren Zugriff
window.getApiUrl = function(endpoint) {
  return window.AWS_APP_CONFIG.getEndpointUrl(endpoint);
};

console.log('✅ AWS App Config loaded, API_BASE:', window.AWS_APP_CONFIG.API_BASE || 'Netlify Fallback');