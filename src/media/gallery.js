/**
 * PhotoSwipe Gallery Integration
 * Erweiterte Galerie-Funktionalität mit Filter, Sortierung und Suche
 */

import PhotoSwipe from 'photoswipe';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

/**
 * Gallery Manager Class
 */
export class GalleryManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = {
      showThumbnails: true,
      showCaptions: true,
      showMetadata: true,
      enableZoom: true,
      enableFullscreen: true,
      enableKeyboard: true,
      enableTouch: true,
      showCounter: true,
      showCloseButton: true,
      ...options
    };
    
    this.mediaItems = [];
    this.filteredItems = [];
    this.currentFilter = 'all';
    this.currentSort = 'newest';
    this.searchQuery = '';
    this.lightbox = null;
    this.currentIndex = 0;
    
    this.init();
  }

  /**
   * Gallery initialisieren
   */
  init() {
    if (!this.container) {
      console.error('Gallery container not found:', this.containerId);
      return;
    }

    this.setupLightbox();
    this.setupFilters();
    this.setupSearch();
    this.setupSorting();
    this.setupKeyboard();
    this.setupTouch();
    this.render();
  }

  /**
   * PhotoSwipe Lightbox einrichten
   */
  setupLightbox() {
    this.lightbox = new PhotoSwipeLightbox({
      gallery: `#${this.containerId}`,
      children: 'a[data-pswp-src]',
      pswpModule: () => import('photoswipe'),
      showHideOpacity: true,
      bgOpacity: 0.8,
      spacing: 0.1,
      allowPanToNext: true,
      maxWidthToAnimate: 400,
      loop: false,
      wrap: false,
      preloadFirstSlide: true,
      preload: [1, 1],
      showHideOpacity: true,
      bgOpacity: 0.8,
      spacing: 0.1,
      allowPanToNext: true,
      maxWidthToAnimate: 400,
      loop: false,
      wrap: false,
      preloadFirstSlide: true,
      preload: [1, 1]
    });

    // Custom Events
    this.lightbox.on('uiRegister', () => {
      this.setupCustomUI();
    });

    this.lightbox.on('beforeOpen', () => {
      this.onBeforeOpen();
    });

    this.lightbox.on('afterOpen', () => {
      this.onAfterOpen();
    });

    this.lightbox.on('beforeClose', () => {
      this.onBeforeClose();
    });

    this.lightbox.on('afterClose', () => {
      this.onAfterClose();
    });

    this.lightbox.init();
  }

  /**
   * Custom UI für PhotoSwipe
   */
  setupCustomUI() {
    // Custom Buttons hinzufügen
    this.lightbox.pswp.on('uiRegister', () => {
      // Download Button
      this.lightbox.pswp.ui.registerElement({
        name: 'download-button',
        order: 8,
        isButton: true,
        html: '<button class="pswp__button pswp__button--download" title="Download"></button>',
        onInit: (el, pswp) => {
          el.onclick = () => {
            const currentSlide = pswp.currSlide;
            if (currentSlide) {
              this.downloadMedia(currentSlide.data);
            }
          };
        }
      });

      // Share Button
      this.lightbox.pswp.ui.registerElement({
        name: 'share-button',
        order: 9,
        isButton: true,
        html: '<button class="pswp__button pswp__button--share" title="Share"></button>',
        onInit: (el, pswp) => {
          el.onclick = () => {
            const currentSlide = pswp.currSlide;
            if (currentSlide) {
              this.shareMedia(currentSlide.data);
            }
          };
        }
      });

      // Info Button
      this.lightbox.pswp.ui.registerElement({
        name: 'info-button',
        order: 10,
        isButton: true,
        html: '<button class="pswp__button pswp__button--info" title="Info"></button>',
        onInit: (el, pswp) => {
          el.onclick = () => {
            const currentSlide = pswp.currSlide;
            if (currentSlide) {
              this.showMediaInfo(currentSlide.data);
            }
          };
        }
      });
    });
  }

  /**
   * Filter einrichten
   */
  setupFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'gallery-filters';
    filterContainer.innerHTML = `
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">Alle</button>
        <button class="filter-btn" data-filter="image">Bilder</button>
        <button class="filter-btn" data-filter="video">Videos</button>
        <button class="filter-btn" data-filter="document">Dokumente</button>
        <button class="filter-btn" data-filter="audio">Audio</button>
      </div>
    `;

    this.container.parentNode.insertBefore(filterContainer, this.container);

    // Filter Event Listeners
    filterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        const filter = e.target.dataset.filter;
        this.setFilter(filter);
        
        // Active Button aktualisieren
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');
      }
    });
  }

  /**
   * Suche einrichten
   */
  setupSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'gallery-search';
    searchContainer.innerHTML = `
      <div class="search-box">
        <input type="text" placeholder="Medien durchsuchen..." class="search-input">
        <button class="search-clear" title="Suche löschen">×</button>
      </div>
    `;

    this.container.parentNode.insertBefore(searchContainer, this.container);

    const searchInput = searchContainer.querySelector('.search-input');
    const searchClear = searchContainer.querySelector('.search-clear');

    // Search Event Listeners
    searchInput.addEventListener('input', (e) => {
      this.setSearchQuery(e.target.value);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      this.setSearchQuery('');
    });
  }

  /**
   * Sortierung einrichten
   */
  setupSorting() {
    const sortContainer = document.createElement('div');
    sortContainer.className = 'gallery-sorting';
    sortContainer.innerHTML = `
      <div class="sort-controls">
        <label for="sort-select">Sortieren nach:</label>
        <select id="sort-select" class="sort-select">
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
          <option value="name">Name A-Z</option>
          <option value="size">Größe</option>
          <option value="type">Typ</option>
        </select>
      </div>
    `;

    this.container.parentNode.insertBefore(sortContainer, this.container);

    const sortSelect = sortContainer.querySelector('.sort-select');
    sortSelect.addEventListener('change', (e) => {
      this.setSorting(e.target.value);
    });
  }

  /**
   * Keyboard Navigation
   */
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox || !this.lightbox.pswp) return;

      switch (e.key) {
        case 'ArrowLeft':
          this.lightbox.pswp.prev();
          break;
        case 'ArrowRight':
          this.lightbox.pswp.next();
          break;
        case 'Escape':
          this.lightbox.pswp.close();
          break;
        case 'f':
        case 'F':
          this.lightbox.pswp.toggleFullscreen();
          break;
        case 'd':
        case 'D':
          const currentSlide = this.lightbox.pswp.currSlide;
          if (currentSlide) {
            this.downloadMedia(currentSlide.data);
          }
          break;
      }
    });
  }

  /**
   * Touch Gestures
   */
  setupTouch() {
    let startX = 0;
    let startY = 0;

    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    this.container.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Swipe Detection
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          // Swipe Left - Next
          this.lightbox.pswp?.next();
        } else if (diffX < -50) {
          // Swipe Right - Previous
          this.lightbox.pswp?.prev();
        }
      }
    });
  }

  /**
   * Media Items laden
   */
  async loadMedia() {
    try {
      const response = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.mediaItems = data.media || [];
      this.applyFilters();
      this.render();

    } catch (error) {
      console.error('❌ Error loading media:', error);
      this.showError('Fehler beim Laden der Medien');
    }
  }

  /**
   * Filter anwenden
   */
  setFilter(filter) {
    this.currentFilter = filter;
    this.applyFilters();
    this.render();
  }

  /**
   * Suche setzen
   */
  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
    this.render();
  }

  /**
   * Sortierung setzen
   */
  setSorting(sort) {
    this.currentSort = sort;
    this.applyFilters();
    this.render();
  }

  /**
   * Filter, Suche und Sortierung anwenden
   */
  applyFilters() {
    let filtered = [...this.mediaItems];

    // Filter anwenden
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (this.currentFilter === 'image') {
          return item.type.startsWith('image/');
        } else if (this.currentFilter === 'video') {
          return item.type.startsWith('video/');
        } else if (this.currentFilter === 'document') {
          return item.type.includes('pdf') || item.type.includes('document');
        } else if (this.currentFilter === 'audio') {
          return item.type.startsWith('audio/');
        }
        return true;
      });
    }

    // Suche anwenden
    if (this.searchQuery) {
      filtered = filtered.filter(item => {
        return item.filename.toLowerCase().includes(this.searchQuery) ||
               item.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
      });
    }

    // Sortierung anwenden
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    this.filteredItems = filtered;
  }

  /**
   * Gallery rendern
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    if (this.filteredItems.length === 0) {
      this.container.innerHTML = `
        <div class="gallery-empty">
          <p>Keine Medien gefunden</p>
        </div>
      `;
      return;
    }

    // Gallery Grid erstellen
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    this.filteredItems.forEach((item, index) => {
      const mediaElement = this.createMediaElement(item, index);
      grid.appendChild(mediaElement);
    });

    this.container.appendChild(grid);
  }

  /**
   * Media Element erstellen
   */
  createMediaElement(item, index) {
    const element = document.createElement('div');
    element.className = 'gallery-item';
    element.dataset.mediaId = item.mediaId;

    if (item.type.startsWith('image/')) {
      element.innerHTML = `
        <a href="${item.cdnUrl}" 
           data-pswp-src="${item.cdnUrl}"
           data-pswp-width="${item.width || 1200}"
           data-pswp-height="${item.height || 900}"
           data-media-id="${item.mediaId}"
           class="gallery-link">
          <img src="${item.thumbnailUrl || item.cdnUrl}" 
               alt="${item.filename}"
               class="gallery-thumbnail"
               loading="lazy">
          <div class="gallery-overlay">
            <div class="gallery-info">
              <h3 class="gallery-title">${item.filename}</h3>
              <p class="gallery-meta">${this.formatFileSize(item.size)} • ${this.formatDate(item.createdAt)}</p>
            </div>
          </div>
        </a>
      `;
    } else {
      element.innerHTML = `
        <div class="gallery-item-document">
          <a href="${item.cdnUrl}" 
             target="_blank"
             class="gallery-link-document">
            <div class="document-icon">
              <i class="fas fa-file-${this.getFileIcon(item.type)}"></i>
            </div>
            <div class="document-info">
              <h3 class="document-title">${item.filename}</h3>
              <p class="document-meta">${this.formatFileSize(item.size)} • ${this.formatDate(item.createdAt)}</p>
            </div>
          </a>
        </div>
      `;
    }

    return element;
  }

  /**
   * Datei-Icon basierend auf MIME-Type
   */
  getFileIcon(type) {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word')) return 'word';
    if (type.includes('excel')) return 'excel';
    if (type.includes('powerpoint')) return 'powerpoint';
    if (type.includes('text')) return 'alt';
    return 'alt';
  }

  /**
   * Datei-Größe formatieren
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Datum formatieren
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Media herunterladen
   */
  downloadMedia(mediaData) {
    const link = document.createElement('a');
    link.href = mediaData.cdnUrl;
    link.download = mediaData.filename;
    link.click();
  }

  /**
   * Media teilen
   */
  shareMedia(mediaData) {
    if (navigator.share) {
      navigator.share({
        title: mediaData.filename,
        url: mediaData.cdnUrl
      });
    } else {
      // Fallback: URL kopieren
      navigator.clipboard.writeText(mediaData.cdnUrl);
      this.showToast('URL in Zwischenablage kopiert');
    }
  }

  /**
   * Media Info anzeigen
   */
  showMediaInfo(mediaData) {
    const info = `
      <div class="media-info">
        <h3>${mediaData.filename}</h3>
        <p><strong>Typ:</strong> ${mediaData.type}</p>
        <p><strong>Größe:</strong> ${this.formatFileSize(mediaData.size)}</p>
        <p><strong>Erstellt:</strong> ${this.formatDate(mediaData.createdAt)}</p>
        <p><strong>URL:</strong> <a href="${mediaData.cdnUrl}" target="_blank">${mediaData.cdnUrl}</a></p>
      </div>
    `;
    
    // Modal oder Tooltip anzeigen
    this.showModal('Media Info', info);
  }

  /**
   * Modal anzeigen
   */
  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close Event Listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Toast anzeigen
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  /**
   * Fehler anzeigen
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="gallery-error">
        <p>❌ ${message}</p>
      </div>
    `;
  }

  /**
   * Auth Token abrufen
   */
  async getAuthToken() {
    // Hier würde der Auth Token aus dem Auth System abgerufen
    return localStorage.getItem('auth_token');
  }

  /**
   * Event Handlers
   */
  onBeforeOpen() {
    console.log('Gallery opening...');
  }

  onAfterOpen() {
    console.log('Gallery opened');
  }

  onBeforeClose() {
    console.log('Gallery closing...');
  }

  onAfterClose() {
    console.log('Gallery closed');
  }
}

export default GalleryManager;
