/**
 * Media Manager für Upload und Verwaltung
 * Uppy Integration mit S3 Pre-signed URLs
 */

import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3 from '@uppy/aws-s3';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

/**
 * Media Manager Class
 */
export class MediaManager {
  constructor() {
    this.uppy = null;
    this.mediaList = [];
    this.currentFilter = 'all';
    this.currentSort = 'newest';
    this.photoSwipe = null;
  }

  /**
   * Uppy Uploader mit erweiterten Features initialisieren
   */
  initializeUploader(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Upload-Container nicht gefunden:', containerId);
      return;
    }

    const defaultOptions = {
      restrictions: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxNumberOfFiles: 10,
        allowedFileTypes: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      },
      autoProceed: false,
      allowMultipleUploadBatches: true,
      debug: false,
      meta: {
        uploader: 'Manuel Weiss Platform',
        version: '2.0.0'
      }
    };

    this.uppy = new Uppy({
      ...defaultOptions,
      ...options
    });

    // Erweiterte Konfiguration
    this.setupAdvancedFeatures();
    this.setupProgressTracking();
    this.setupErrorHandling();
    this.setupRetryMechanism();
    this.setupCompression();
    this.setupThumbnails();
    this.setupMetadataExtraction();
    this.setupVirusScanning();
    this.setupWatermarking();
    this.setupBatchProcessing();
  }

  /**
   * Erweiterte Features einrichten
   */
  setupAdvancedFeatures() {
    // Drag & Drop Verbesserungen
    this.uppy.on('drag-over', (data) => {
      this.handleDragOver(data);
    });

    this.uppy.on('drag-leave', (data) => {
      this.handleDragLeave(data);
    });

    // Datei-Vorschau
    this.uppy.on('file-added', (file) => {
      this.handleFileAdded(file);
    });

    // Upload-Queue Management
    this.uppy.on('upload', (data) => {
      this.handleUploadStart(data);
    });

    // Batch-Processing
    this.uppy.on('upload-success', (file, response) => {
      this.handleUploadSuccess(file, response);
    });

    this.uppy.on('upload-error', (file, error) => {
      this.handleUploadError(file, error);
    });
  }

  /**
   * Progress Tracking einrichten
   */
  setupProgressTracking() {
    this.uploadProgress = {
      total: 0,
      completed: 0,
      failed: 0,
      current: null
    };

    this.uppy.on('upload-progress', (file, progress) => {
      this.updateProgress(file, progress);
    });

    this.uppy.on('upload-success', (file, response) => {
      this.uploadProgress.completed++;
      this.updateOverallProgress();
    });

    this.uppy.on('upload-error', (file, error) => {
      this.uploadProgress.failed++;
      this.updateOverallProgress();
    });
  }

  /**
   * Error Handling einrichten
   */
  setupErrorHandling() {
    this.errorHandlers = {
      network: this.handleNetworkError.bind(this),
      server: this.handleServerError.bind(this),
      validation: this.handleValidationError.bind(this),
      quota: this.handleQuotaError.bind(this),
      virus: this.handleVirusError.bind(this)
    };

    this.uppy.on('upload-error', (file, error) => {
      this.handleUploadError(file, error);
    });
  }

  /**
   * Retry-Mechanismus einrichten
   */
  setupRetryMechanism() {
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true
    };

    this.uppy.on('upload-error', (file, error) => {
      this.scheduleRetry(file, error);
    });
  }

  /**
   * Kompression einrichten
   */
  setupCompression() {
    this.compressionConfig = {
      enabled: true,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      formats: ['image/jpeg', 'image/png', 'image/webp']
    };

    this.uppy.on('file-added', (file) => {
      if (this.shouldCompress(file)) {
        this.compressFile(file);
      }
    });
  }

  /**
   * Thumbnails einrichten
   */
  setupThumbnails() {
    this.uppy.on('file-added', (file) => {
      if (file.type.startsWith('image/')) {
        this.generateThumbnail(file);
      }
    });
  }

  /**
   * Metadaten-Extraktion einrichten
   */
  setupMetadataExtraction() {
    this.uppy.on('file-added', (file) => {
      this.extractMetadata(file);
    });
  }

  /**
   * Virus-Scanning einrichten
   */
  setupVirusScanning() {
    this.uppy.on('file-added', (file) => {
      this.scanForVirus(file);
    });
  }

  /**
   * Watermarking einrichten
   */
  setupWatermarking() {
    this.watermarkConfig = {
      enabled: false,
      text: 'Manuel Weiss Platform',
      position: 'bottom-right',
      opacity: 0.5
    };

    this.uppy.on('file-added', (file) => {
      if (this.shouldAddWatermark(file)) {
        this.addWatermark(file);
      }
    });
  }

  /**
   * Batch-Processing einrichten
   */
  setupBatchProcessing() {
    this.batchConfig = {
      maxConcurrent: 3,
      delay: 1000,
      priority: 'fifo'
    };

    this.uppy.on('upload', (data) => {
      this.processBatch(data);
    });
  }

    // AWS S3 Plugin
    this.uppy.use(AwsS3, {
      companionUrl: null,
      getUploadParameters: async (file) => {
        try {
          const response = await fetch('/api/media/presign', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${await this.getAuthToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filename: file.name,
              type: file.type,
              size: file.size
            })
          });

          if (!response.ok) {
            throw new Error('Presigned URL konnte nicht erstellt werden');
          }

          const { url, fields } = await response.json();
          
          return {
            method: 'POST',
            url: url,
            fields: fields
          };
        } catch (error) {
          console.error('Upload-Parameter-Fehler:', error);
          throw error;
        }
      }
    });

    // Dashboard Plugin
    this.uppy.use(Dashboard, {
      target: container,
      inline: true,
      height: 400,
      showProgressDetails: true,
      proudlyDisplayPoweredByUppy: false,
      note: 'Bilder, PDFs und Dokumente bis 100MB',
      locale: {
        strings: {
          dropPasteFiles: 'Dateien hier ablegen oder %{browseFiles}',
          browseFiles: 'durchsuchen'
        }
      }
    });

    // Event Listeners
    this.uppy.on('upload-success', (file, response) => {
      console.log('Upload erfolgreich:', file.name);
      this.handleUploadSuccess(file, response);
    });

    this.uppy.on('upload-error', (file, error) => {
      console.error('Upload-Fehler:', file.name, error);
      this.showUploadError(file.name, error.message);
    });

    this.uppy.on('complete', (result) => {
      console.log('Alle Uploads abgeschlossen:', result);
      this.loadMediaList();
    });
  }

  /**
   * Upload-Erfolg behandeln
   */
  async handleUploadSuccess(file, response) {
    try {
      // Medien-Metadaten an Server senden
      const mediaData = {
        key: response.uploadURL.split('/').pop(),
        filename: file.name,
        type: file.type,
        size: file.size,
        width: file.meta?.width || null,
        height: file.meta?.height || null,
        cdnUrl: `${process.env.CLOUDFRONT_URL}/media/${response.uploadURL.split('/').pop()}`
      };

      const completeResponse = await fetch('/api/media/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mediaData)
      });

      if (completeResponse.ok) {
        this.showUploadSuccess(file.name);
      }
    } catch (error) {
      console.error('Upload-Completion-Fehler:', error);
    }
  }

  /**
   * Medienliste laden
   */
  async loadMediaList() {
    try {
      const response = await fetch('/api/media', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.mediaList = data.media || [];
      
      this.renderMediaList();
      return {
        success: true,
        media: this.mediaList
      };
    } catch (error) {
      console.error('Medienliste-Ladefehler:', error);
      return {
        success: false,
        error: error.message || 'Medienliste konnte nicht geladen werden'
      };
    }
  }

  /**
   * Medienliste rendern
   */
  renderMediaList(containerId = 'mediaList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filteredMedia = this.getFilteredMedia();
    
    container.innerHTML = `
      <div class="media-controls">
        <div class="media-filters">
          <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                  onclick="mediaManager.setFilter('all')">Alle</button>
          <button class="filter-btn ${this.currentFilter === 'images' ? 'active' : ''}" 
                  onclick="mediaManager.setFilter('images')">Bilder</button>
          <button class="filter-btn ${this.currentFilter === 'documents' ? 'active' : ''}" 
                  onclick="mediaManager.setFilter('documents')">Dokumente</button>
        </div>
        <div class="media-sort">
          <select onchange="mediaManager.setSort(this.value)">
            <option value="newest" ${this.currentSort === 'newest' ? 'selected' : ''}>Neueste zuerst</option>
            <option value="oldest" ${this.currentSort === 'oldest' ? 'selected' : ''}>Älteste zuerst</option>
            <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>Nach Name</option>
            <option value="size" ${this.currentSort === 'size' ? 'selected' : ''}>Nach Größe</option>
          </select>
        </div>
      </div>
      <div class="media-grid">
        ${filteredMedia.map(media => this.renderMediaItem(media)).join('')}
      </div>
    `;
  }

  /**
   * Einzelnes Medien-Item rendern
   */
  renderMediaItem(media) {
    const isImage = media.type.startsWith('image/');
    const fileSize = this.formatFileSize(media.size);
    const uploadDate = new Date(media.createdAt).toLocaleDateString('de-DE');
    
    return `
      <div class="media-item" data-media-id="${media.id}">
        <div class="media-thumbnail" onclick="mediaManager.openLightbox('${media.id}')">
          ${isImage ? 
            `<img src="${media.cdnUrl}" alt="${media.filename}" loading="lazy">` :
            `<div class="file-icon">
              <i class="fas fa-file-${this.getFileIcon(media.type)}"></i>
            </div>`
          }
        </div>
        <div class="media-info">
          <h4 class="media-filename" title="${media.filename}">${media.filename}</h4>
          <p class="media-meta">
            ${fileSize} • ${uploadDate}
          </p>
          <div class="media-actions">
            <button class="btn-copy" onclick="mediaManager.copyUrl('${media.cdnUrl}')" 
                    title="URL kopieren">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn-download" onclick="mediaManager.downloadMedia('${media.id}')" 
                    title="Herunterladen">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-delete" onclick="mediaManager.deleteMedia('${media.id}')" 
                    title="Löschen">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Filter setzen
   */
  setFilter(filter) {
    this.currentFilter = filter;
    this.renderMediaList();
  }

  /**
   * Sortierung setzen
   */
  setSort(sort) {
    this.currentSort = sort;
    this.renderMediaList();
  }

  /**
   * Gefilterte Medien abrufen
   */
  getFilteredMedia() {
    let filtered = [...this.mediaList];
    
    // Filter anwenden
    if (this.currentFilter === 'images') {
      filtered = filtered.filter(media => media.type.startsWith('image/'));
    } else if (this.currentFilter === 'documents') {
      filtered = filtered.filter(media => !media.type.startsWith('image/'));
    }
    
    // Sortierung anwenden
    switch (this.currentSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'size':
        filtered.sort((a, b) => b.size - a.size);
        break;
    }
    
    return filtered;
  }

  /**
   * Lightbox öffnen
   */
  openLightbox(mediaId) {
    const media = this.mediaList.find(m => m.id === mediaId);
    if (!media || !media.type.startsWith('image/')) return;

    const items = this.mediaList
      .filter(m => m.type.startsWith('image/'))
      .map(m => ({
        src: m.cdnUrl,
        width: m.width || 1920,
        height: m.height || 1080,
        alt: m.filename
      }));

    const currentIndex = items.findIndex(item => 
      item.src === media.cdnUrl
    );

    this.photoSwipe = new PhotoSwipe({
      dataSource: items,
      index: currentIndex,
      bgOpacity: 0.8,
      showHideOpacity: true
    });

    this.photoSwipe.init();
  }

  /**
   * URL kopieren
   */
  async copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      this.showToast('URL in Zwischenablage kopiert');
    } catch (error) {
      console.error('Kopier-Fehler:', error);
      this.showToast('URL konnte nicht kopiert werden', 'error');
    }
  }

  /**
   * Medien herunterladen
   */
  async downloadMedia(mediaId) {
    try {
      const media = this.mediaList.find(m => m.id === mediaId);
      if (!media) return;

      const response = await fetch(media.cdnUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download-Fehler:', error);
      this.showToast('Download fehlgeschlagen', 'error');
    }
  }

  /**
   * Medien löschen
   */
  async deleteMedia(mediaId) {
    if (!confirm('Möchten Sie dieses Medium wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Aus Liste entfernen
      this.mediaList = this.mediaList.filter(m => m.id !== mediaId);
      this.renderMediaList();
      
      this.showToast('Medium erfolgreich gelöscht');
    } catch (error) {
      console.error('Lösch-Fehler:', error);
      this.showToast('Löschen fehlgeschlagen', 'error');
    }
  }

  /**
   * Auth Token abrufen
   */
  async getAuthToken() {
    // Hier würde der echte JWT Token abgerufen werden
    return 'demo-jwt-token';
  }

  /**
   * Dateigröße formatieren
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Datei-Icon abrufen
   */
  getFileIcon(type) {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word')) return 'word';
    if (type.includes('excel')) return 'excel';
    if (type.includes('powerpoint')) return 'powerpoint';
    return 'alt';
  }

  /**
   * Toast-Nachricht anzeigen
   */
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Upload-Erfolg anzeigen
   */
  showUploadSuccess(filename) {
    this.showToast(`${filename} erfolgreich hochgeladen`);
  }

  /**
   * Upload-Fehler anzeigen
   */
  showUploadError(filename, error) {
    this.showToast(`${filename}: ${error}`, 'error');
  }
}

// Singleton Instance
export const mediaManager = new MediaManager();
