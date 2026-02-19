'use strict';

/**
 * Central AWS App Configuration
 * Nach CDK Deploy wird API_BASE automatisch gesetzt
 * 
 * Deployment:
 * 1. cd infrastructure && npx cdk deploy manuel-weiss-website-api
 * 2. API URL aus Output kopieren und hier eintragen
 */

// API Base URL - AWS API Gateway
const USE_AWS_API = true;

window.AWS_APP_CONFIG = Object.assign({}, window.AWS_APP_CONFIG || {}, {
  // ========================================
  // API KONFIGURATION
  // ========================================
  
  // ✅ API Gateway URL nach CDK Deploy eingetragen (2026-01-21)
  // Format: https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1
  API_BASE: USE_AWS_API 
    ? 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1'
    : '', // Muss gesetzt sein - AWS API Gateway URL erforderlich
  
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
    
    // User Profile API (Phase 3 Migration)
    USER_PROFILE_API: '/user-profile-api',
    
    // Profile Image Upload
    PROFILE_IMAGE_UPLOAD: '/profile-image/upload-url',
    S3_UPLOAD: '/profile-image/upload-url',
    
    // Snowflake Game
    SNOWFLAKE_HIGHSCORES: '/snowflake-highscores',

    // HR-Automation (BPMN)
    TEXT_TO_BPMN: '/text-to-bpmn',
    TEXT_TO_BPMN_GPT: '/text-to-bpmn-gpt',

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
   * Gibt die vollständige URL für einen Endpoint zurück (AWS API Gateway)
   */
  getEndpointUrl: function(endpoint) {
    if (!this.API_BASE || this.API_BASE.length === 0) {
      console.error('❌ API_BASE nicht konfiguriert. Bitte AWS API Gateway URL in aws-app-config.js eintragen.');
      return null;
    }
    
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
  }
});

// Alias für einfacheren Zugriff
window.getApiUrl = function(endpoint) {
  return window.AWS_APP_CONFIG.getEndpointUrl(endpoint);
};

console.log('✅ AWS App Config loaded, API_BASE:', window.AWS_APP_CONFIG.API_BASE || 'NICHT KONFIGURIERT');