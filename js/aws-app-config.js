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
const USE_AWS_API = true; // ✅ Auf true gesetzt nach erfolgreichem CDK Deploy

window.AWS_APP_CONFIG = Object.assign({}, window.AWS_APP_CONFIG || {}, {
  // ========================================
  // API KONFIGURATION
  // ========================================
  
  // ✅ API Gateway URL nach CDK Deploy eingetragen (2026-01-21)
  // Format: https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1
  API_BASE: USE_AWS_API 
    ? 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1'
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
    
    // Hero Video (Phase 1 Migration)
    HERO_VIDEO_SETTINGS: '/hero-video-settings',
    HERO_VIDEO_UPLOAD: '/hero-video-upload',
    HERO_VIDEO_UPLOAD_DIRECT: '/hero-video-upload-direct',
    
    // Bewerbungsprofil (Phase 2 Migration)
    BEWERBUNGSPROFIL: '/bewerbungsprofil',
    
    // Profile Image Upload
    PROFILE_IMAGE_UPLOAD: '/profile-image/upload-url',
    S3_UPLOAD: '/profile-image/upload-url',
    
    // Snowflake Game
    SNOWFLAKE_HIGHSCORES: '/snowflake-highscores',
    
    // Contact
    CONTACT_EMAIL: '/contact-email',
    
    // PDF Generator (Puppeteer)
    PDF_GENERATOR: '/pdf-generator'
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
      const endpointPath = this.ENDPOINTS[endpoint];
      if (!endpointPath) {
        console.error('❌ Endpoint nicht gefunden:', endpoint);
        return null;
      }
      // Stelle sicher, dass API_BASE mit / endet und endpointPath mit / beginnt
      const base = this.API_BASE.endsWith('/') ? this.API_BASE.slice(0, -1) : this.API_BASE;
      const path = endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath;
      return base + path;
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
        'HERO_VIDEO_UPLOAD_DIRECT': '/.netlify/functions/hero-video-upload-direct',
        'BEWERBUNGSPROFIL': '/.netlify/functions/bewerbungsprofil-api',
        'PROFILE_IMAGE_UPLOAD': '/.netlify/functions/s3-upload',
        'S3_UPLOAD': '/.netlify/functions/s3-upload',
        'SNOWFLAKE_HIGHSCORES': '/.netlify/functions/snowflake-highscores',
        'CONTACT_EMAIL': '/.netlify/functions/send-contact-email',
        'PDF_GENERATOR': '/.netlify/functions/pdf-generator'
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