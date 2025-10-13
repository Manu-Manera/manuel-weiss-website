/**
 * Media Components für Website-Integration
 * Wiederverwendbare Komponenten für Bilder, Videos, Dokumente
 */

/**
 * Image with Caption Component
 */
export class ImageWithCaption {
  constructor(options = {}) {
    this.src = options.src;
    this.alt = options.alt || '';
    this.caption = options.caption || '';
    this.width = options.width || 'auto';
    this.height = options.height || 'auto';
    this.lazy = options.lazy !== false;
    this.lightbox = options.lightbox !== false;
    this.className = options.className || '';
  }

  render() {
    const imgElement = document.createElement('img');
    imgElement.src = this.src;
    imgElement.alt = this.alt;
    imgElement.className = `image-with-caption ${this.className}`;
    imgElement.style.width = this.width;
    imgElement.style.height = this.height;
    
    if (this.lazy) {
      imgElement.loading = 'lazy';
    }

    if (this.lightbox) {
      imgElement.addEventListener('click', () => this.openLightbox());
    }

    const container = document.createElement('figure');
    container.className = 'media-container';
    container.appendChild(imgElement);

    if (this.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = this.caption;
      caption.className = 'media-caption';
      container.appendChild(caption);
    }

    return container;
  }

  openLightbox() {
    // Lightbox-Implementation
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="${this.src}" alt="${this.alt}">
        <button class="lightbox-close">&times;</button>
        ${this.caption ? `<div class="lightbox-caption">${this.caption}</div>` : ''}
      </div>
    `;

    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `;

    document.body.appendChild(lightbox);

    // Close on click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.remove();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        lightbox.remove();
      }
    });
  }
}

/**
 * Video Embed Component
 */
export class VideoEmbed {
  constructor(options = {}) {
    this.src = options.src;
    this.poster = options.poster || '';
    this.title = options.title || '';
    this.autoplay = options.autoplay || false;
    this.controls = options.controls !== false;
    this.loop = options.loop || false;
    this.muted = options.muted || false;
    this.width = options.width || '100%';
    this.height = options.height || 'auto';
    this.className = options.className || '';
  }

  render() {
    const video = document.createElement('video');
    video.src = this.src;
    video.className = `video-embed ${this.className}`;
    video.style.width = this.width;
    video.style.height = this.height;
    
    if (this.poster) {
      video.poster = this.poster;
    }
    
    if (this.title) {
      video.title = this.title;
    }
    
    if (this.autoplay) {
      video.autoplay = true;
    }
    
    if (this.controls) {
      video.controls = true;
    }
    
    if (this.loop) {
      video.loop = true;
    }
    
    if (this.muted) {
      video.muted = true;
    }

    const container = document.createElement('div');
    container.className = 'video-container';
    container.appendChild(video);

    return container;
  }
}

/**
 * Document Link Component
 */
export class DocumentLink {
  constructor(options = {}) {
    this.url = options.url;
    this.filename = options.filename || 'Dokument';
    this.type = options.type || 'document';
    this.size = options.size || '';
    this.icon = options.icon || this.getFileIcon(this.type);
    this.className = options.className || '';
  }

  render() {
    const link = document.createElement('a');
    link.href = this.url;
    link.className = `document-link ${this.className}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    link.innerHTML = `
      <div class="document-icon">
        <i class="fas fa-${this.icon}"></i>
      </div>
      <div class="document-info">
        <div class="document-name">${this.filename}</div>
        ${this.size ? `<div class="document-size">${this.size}</div>` : ''}
      </div>
      <div class="document-arrow">
        <i class="fas fa-external-link-alt"></i>
      </div>
    `;

    return link;
  }

  getFileIcon(type) {
    const iconMap = {
      'pdf': 'file-pdf',
      'word': 'file-word',
      'excel': 'file-excel',
      'powerpoint': 'file-powerpoint',
      'image': 'file-image',
      'video': 'file-video',
      'audio': 'file-audio',
      'archive': 'file-archive',
      'code': 'file-code',
      'document': 'file-alt'
    };
    
    return iconMap[type] || 'file-alt';
  }
}

/**
 * Media Gallery Component
 */
export class MediaGallery {
  constructor(options = {}) {
    this.media = options.media || [];
    this.columns = options.columns || 3;
    this.gap = options.gap || '1rem';
    this.lightbox = options.lightbox !== false;
    this.className = options.className || '';
  }

  render() {
    const gallery = document.createElement('div');
    gallery.className = `media-gallery ${this.className}`;
    gallery.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.columns}, 1fr);
      gap: ${this.gap};
    `;

    this.media.forEach((item, index) => {
      const mediaItem = this.createMediaItem(item, index);
      gallery.appendChild(mediaItem);
    });

    return gallery;
  }

  createMediaItem(item, index) {
    const itemElement = document.createElement('div');
    itemElement.className = 'gallery-item';
    
    if (item.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.alt || item.filename;
      img.loading = 'lazy';
      
      if (this.lightbox) {
        img.addEventListener('click', () => this.openLightbox(index));
        img.style.cursor = 'pointer';
      }
      
      itemElement.appendChild(img);
    } else {
      const docLink = new DocumentLink({
        url: item.url,
        filename: item.filename,
        type: item.type,
        size: item.size
      });
      
      itemElement.appendChild(docLink.render());
    }

    return itemElement;
  }

  openLightbox(index) {
    const images = this.media.filter(item => item.type.startsWith('image/'));
    const currentIndex = images.findIndex(img => img === this.media[index]);
    
    if (currentIndex === -1) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="${images[currentIndex].url}" alt="${images[currentIndex].alt}">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&lt;</button>
        <button class="lightbox-next">&gt;</button>
        <div class="lightbox-counter">${currentIndex + 1} / ${images.length}</div>
      </div>
    `;

    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    document.body.appendChild(lightbox);

    // Navigation
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const img = lightbox.querySelector('img');

    prevBtn.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      img.src = images[newIndex].url;
      img.alt = images[newIndex].alt;
      lightbox.querySelector('.lightbox-counter').textContent = `${newIndex + 1} / ${images.length}`;
    });

    nextBtn.addEventListener('click', () => {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      img.src = images[newIndex].url;
      img.alt = images[newIndex].alt;
      lightbox.querySelector('.lightbox-counter').textContent = `${newIndex + 1} / ${images.length}`;
    });

    // Close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.remove();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        lightbox.remove();
      } else if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn.click();
      }
    });
  }
}

/**
 * Media Factory für einfache Erstellung
 */
export class MediaFactory {
  static createImage(src, options = {}) {
    return new ImageWithCaption({ src, ...options });
  }

  static createVideo(src, options = {}) {
    return new VideoEmbed({ src, ...options });
  }

  static createDocument(url, options = {}) {
    return new DocumentLink({ url, ...options });
  }

  static createGallery(media, options = {}) {
    return new MediaGallery({ media, ...options });
  }
}

// CSS Styles für Media Components
export const mediaStyles = `
.media-container {
  margin: 1rem 0;
  text-align: center;
}

.media-caption {
  margin-top: 0.5rem;
  font-style: italic;
  color: #666;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.document-link {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
}

.document-link:hover {
  background: #f8fafc;
  border-color: #667eea;
  transform: translateY(-2px);
}

.document-icon {
  font-size: 2rem;
  color: #667eea;
  margin-right: 1rem;
}

.document-info {
  flex: 1;
}

.document-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.document-size {
  font-size: 0.875rem;
  color: #666;
}

.document-arrow {
  color: #999;
}

.media-gallery {
  display: grid;
  gap: 1rem;
}

.gallery-item {
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
}

.lightbox-close {
  top: 1rem;
  right: 1rem;
}

.lightbox-prev {
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-next {
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}
`;

// Styles in DOM einfügen
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaStyles;
  document.head.appendChild(styleSheet);
}
