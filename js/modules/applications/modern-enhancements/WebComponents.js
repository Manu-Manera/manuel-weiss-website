// 🧩 Modern Web Components - Custom Elements für wiederverwendbare UI
// Shadow DOM, Custom Elements, HTML Templates mit 2024/2025 Standards

export class ModernWebComponents {
    constructor(options = {}) {
        this.config = {
            enableShadowDOM: options.enableShadowDOM !== false,
            enableFormAssociation: options.enableFormAssociation !== false,
            enableCustomStateAPI: options.enableCustomStateAPI !== false,
            autoRegister: options.autoRegister !== false,
            ...options
        };

        this.registeredComponents = new Set();
        this.componentRegistry = new Map();
        
        this.init();
    }

    init() {
        if (!this.isSupported()) {
            console.warn('⚠️ Web Components not fully supported');
            return;
        }

        console.log('🧩 Initializing Modern Web Components...');
        
        this.registerModernComponents();
        this.setupComponentStyles();
        
        if (this.config.autoRegister) {
            this.autoRegisterComponents();
        }
        
        console.log('✅ Modern Web Components initialized');
    }

    isSupported() {
        return 'customElements' in window && 
               'attachShadow' in Element.prototype &&
               'constructor' in HTMLElement.prototype;
    }

    registerModernComponents() {
        // Application Card Component
        this.registerComponent('application-card', ApplicationCard);
        
        // Statistics Widget Component
        this.registerComponent('stats-widget', StatsWidget);
        
        // File Upload Component
        this.registerComponent('file-dropzone', FileDropzone);
        
        // Smart Button Component
        this.registerComponent('smart-button', SmartButton);
        
        // Progress Ring Component
        this.registerComponent('progress-ring', ProgressRing);
        
        // Notification Toast Component
        this.registerComponent('notification-toast', NotificationToast);
        
        // Modern Modal Component
        this.registerComponent('modal-dialog', ModalDialog);
        
        // Chart Container Component
        this.registerComponent('chart-container', ChartContainer);
    }

    registerComponent(name, componentClass) {
        try {
            if (!customElements.get(name)) {
                customElements.define(name, componentClass);
                this.registeredComponents.add(name);
                this.componentRegistry.set(name, componentClass);
                console.log(`✅ Component '${name}' registered`);
            }
        } catch (error) {
            console.error(`❌ Failed to register component '${name}':`, error);
        }
    }

    setupComponentStyles() {
        const componentCSS = `
            /* 🎨 Web Component Base Styles */
            
            /* Ensure components respect container queries */
            application-card,
            stats-widget,
            chart-container {
                display: block;
                container-type: inline-size;
            }
            
            /* Loading states for components */
            :not(:defined) {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            :defined {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Focus management for custom elements */
            [tabindex="0"]:focus {
                outline: 2px solid var(--primary, #667eea);
                outline-offset: 2px;
                border-radius: 4px;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'web-components-base';
        style.textContent = componentCSS;
        document.head.appendChild(style);
    }

    autoRegisterComponents() {
        // Automatically detect and upgrade existing elements
        document.addEventListener('DOMContentLoaded', () => {
            this.upgradeExistingElements();
        });

        // Watch for dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this.upgradeNewElements(mutation.addedNodes);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    upgradeExistingElements() {
        this.registeredComponents.forEach(componentName => {
            const elements = document.querySelectorAll(`${componentName}:not(:defined)`);
            elements.forEach(element => {
                this.upgradeElement(element);
            });
        });
    }

    upgradeNewElements(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                this.registeredComponents.forEach(componentName => {
                    if (node.tagName.toLowerCase() === componentName) {
                        this.upgradeElement(node);
                    }
                });
            }
        });
    }

    upgradeElement(element) {
        // Add upgrade animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        customElements.whenDefined(element.tagName.toLowerCase()).then(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // 🎯 Component Templates
    createComponentTemplate(templateId, template) {
        const templateElement = document.createElement('template');
        templateElement.id = templateId;
        templateElement.innerHTML = template;
        
        document.head.appendChild(templateElement);
        return templateElement;
    }

    // 📊 Component Analytics
    getComponentUsage() {
        const usage = {};
        
        this.registeredComponents.forEach(componentName => {
            const elements = document.querySelectorAll(componentName);
            usage[componentName] = {
                count: elements.length,
                defined: elements.length > 0 ? customElements.get(componentName) !== undefined : false
            };
        });
        
        return usage;
    }

    // 🧹 Cleanup
    destroy() {
        const baseStyle = document.querySelector('#web-components-base');
        if (baseStyle) {
            baseStyle.remove();
        }
        
        this.registeredComponents.clear();
        this.componentRegistry.clear();
    }
}

// 🧩 Modern Application Card Component
class ApplicationCard extends HTMLElement {
    static get observedAttributes() {
        return ['company', 'position', 'status', 'date', 'selected'];
    }

    constructor() {
        super();
        
        if (this.attachShadow) {
            this.attachShadow({ mode: 'open' });
            this.render();
        }
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.render();
        }
        this.setupEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const template = `
            <style>
                :host {
                    display: block;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 1.5rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border-left: 4px solid transparent;
                }
                
                :host(:hover) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                :host([selected]) {
                    border-left-color: var(--primary, #667eea);
                    background: var(--primary-light, #f0f4ff);
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                
                .company {
                    font-weight: 700;
                    color: #1f2937;
                    font-size: 1.125rem;
                }
                
                .status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .status[data-status="pending"] {
                    background: #fef3c7;
                    color: #92400e;
                }
                
                .status[data-status="interview"] {
                    background: #dbeafe;
                    color: #1e40af;
                }
                
                .status[data-status="offer"] {
                    background: #dcfce7;
                    color: #166534;
                }
                
                .position {
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                
                .date {
                    font-size: 0.875rem;
                    color: #9ca3af;
                }
                
                @container (max-width: 300px) {
                    .card-header {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    
                    .company {
                        font-size: 1rem;
                    }
                }
            </style>
            
            <div class="card-header">
                <div class="company">${this.getAttribute('company') || 'Unternehmen'}</div>
                <div class="status" data-status="${this.getAttribute('status') || 'pending'}">
                    ${this.getStatusText(this.getAttribute('status'))}
                </div>
            </div>
            
            <div class="position">${this.getAttribute('position') || 'Position'}</div>
            <div class="date">Beworben: ${this.formatDate(this.getAttribute('date'))}</div>
            
            <slot></slot>
        `;
        
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = template;
        } else {
            this.innerHTML = template;
        }
    }

    setupEventListeners() {
        this.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('application-selected', {
                detail: {
                    company: this.getAttribute('company'),
                    position: this.getAttribute('position'),
                    status: this.getAttribute('status')
                },
                bubbles: true
            }));
        });
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Ausstehend',
            interview: 'Interview',
            offer: 'Zusage',
            rejected: 'Absage'
        };
        return statusMap[status] || 'Unbekannt';
    }

    formatDate(dateStr) {
        if (!dateStr) return 'Unbekannt';
        return new Date(dateStr).toLocaleDateString('de-DE');
    }
}

// 📊 Stats Widget Component with Container Queries
class StatsWidget extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'label', 'trend', 'type'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupAnimations();
    }

    render() {
        const template = `
            <style>
                :host {
                    display: block;
                    container-type: inline-size;
                }
                
                .widget {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .widget::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--widget-color, #667eea);
                }
                
                .value {
                    font-size: clamp(1.5rem, 4cqi, 3rem);
                    font-weight: 800;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                    line-height: 1;
                }
                
                .label {
                    font-size: clamp(0.75rem, 2cqi, 1rem);
                    color: #6b7280;
                    font-weight: 500;
                }
                
                .trend {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 0.75rem;
                    padding: 0.25rem;
                    border-radius: 4px;
                }
                
                .trend.up {
                    color: #059669;
                    background: #dcfce7;
                }
                
                .trend.down {
                    color: #dc2626;
                    background: #fee2e2;
                }
                
                @container (max-width: 120px) {
                    .widget {
                        padding: 1rem;
                    }
                    
                    .trend {
                        display: none;
                    }
                }
            </style>
            
            <div class="widget">
                <div class="value" id="value">${this.getAttribute('value') || '0'}</div>
                <div class="label">${this.getAttribute('label') || 'Metric'}</div>
                ${this.getAttribute('trend') ? `<div class="trend ${this.getTrendClass()}">${this.getAttribute('trend')}</div>` : ''}
                <slot></slot>
            </div>
        `;
        
        this.shadowRoot.innerHTML = template;
    }

    setupAnimations() {
        const value = this.getAttribute('value');
        if (value && !isNaN(value)) {
            this.animateCounter(parseInt(value));
        }
    }

    animateCounter(targetValue) {
        const valueElement = this.shadowRoot.querySelector('#value');
        let currentValue = 0;
        const increment = targetValue / 30;
        const duration = 1000;
        const stepTime = duration / 30;

        const animate = () => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                valueElement.textContent = targetValue;
                return;
            }
            
            valueElement.textContent = Math.floor(currentValue);
            setTimeout(animate, stepTime);
        };

        animate();
    }

    getTrendClass() {
        const trend = this.getAttribute('trend');
        if (trend && trend.startsWith('+')) return 'up';
        if (trend && trend.startsWith('-')) return 'down';
        return '';
    }
}

// 📤 File Dropzone Component
class FileDropzone extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupDragAndDrop();
    }

    render() {
        const template = `
            <style>
                :host {
                    display: block;
                    container-type: inline-size;
                }
                
                .dropzone {
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    background: #fafbfc;
                }
                
                .dropzone:hover,
                .dropzone.drag-over {
                    border-color: #667eea;
                    background: #f0f4ff;
                    transform: scale(1.02);
                }
                
                .dropzone-icon {
                    font-size: 3rem;
                    color: #9ca3af;
                    margin-bottom: 1rem;
                    transition: color 0.3s ease;
                }
                
                .dropzone:hover .dropzone-icon,
                .dropzone.drag-over .dropzone-icon {
                    color: #667eea;
                }
                
                .dropzone-text {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                
                .dropzone-hint {
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                
                .file-list {
                    margin-top: 1rem;
                    text-align: left;
                }
                
                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    border: 1px solid #e5e7eb;
                }
                
                @container (max-width: 300px) {
                    .dropzone {
                        padding: 1rem;
                    }
                    
                    .dropzone-icon {
                        font-size: 2rem;
                    }
                    
                    .dropzone-text {
                        font-size: 0.875rem;
                    }
                }
            </style>
            
            <div class="dropzone" tabindex="0">
                <div class="dropzone-icon">📤</div>
                <div class="dropzone-text">Dateien hierher ziehen oder klicken</div>
                <div class="dropzone-hint">PDF, DOC, JPG, PNG bis 50MB</div>
            </div>
            
            <div class="file-list" id="fileList"></div>
            
            <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display: none;" id="fileInput">
        `;
        
        this.shadowRoot.innerHTML = template;
    }

    setupDragAndDrop() {
        const dropzone = this.shadowRoot.querySelector('.dropzone');
        const fileInput = this.shadowRoot.querySelector('#fileInput');
        
        // Click to upload
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });
        
        // Drag & drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        dropzone.addEventListener('dragenter', () => {
            dropzone.classList.add('drag-over');
        });
        
        dropzone.addEventListener('dragleave', (e) => {
            if (!dropzone.contains(e.relatedTarget)) {
                dropzone.classList.remove('drag-over');
            }
        });
        
        dropzone.addEventListener('drop', (e) => {
            dropzone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
        
        // Keyboard accessibility
        dropzone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });
    }

    handleFiles(files) {
        const fileList = this.shadowRoot.querySelector('#fileList');
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span style="margin-left: auto; font-size: 0.75rem; color: #6b7280;">
                    ${this.formatFileSize(file.size)}
                </span>
            `;
            fileList.appendChild(fileItem);
        });
        
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('files-selected', {
            detail: { files },
            bubbles: true
        }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 🔘 Smart Button Component with Form Association
class SmartButton extends HTMLElement {
    static formAssociated = true;
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.internals_ = this.attachInternals?.();
    }

    connectedCallback() {
        this.render();
        this.setupEnhancedInteractions();
    }

    render() {
        const template = `
            <style>
                :host {
                    display: inline-block;
                }
                
                button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    background: var(--button-bg, #667eea);
                    color: var(--button-color, white);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transition: left 0.5s ease;
                }
                
                button:hover::before {
                    left: 100%;
                }
                
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                button:active {
                    transform: translateY(0);
                }
                
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    background: rgba(255, 255, 255, 0.5);
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            </style>
            
            <button type="${this.getAttribute('type') || 'button'}">
                <slot></slot>
            </button>
        `;
        
        this.shadowRoot.innerHTML = template;
    }

    setupEnhancedInteractions() {
        const button = this.shadowRoot.querySelector('button');
        
        // Material Design ripple effect
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Enhanced keyboard interaction
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    }

    // Form-associated element methods
    get form() { return this.internals_?.form; }
    get name() { return this.getAttribute('name'); }
    get type() { return this.getAttribute('type') || 'button'; }
    get disabled() { return this.hasAttribute('disabled'); }
    
    set disabled(value) {
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
        
        const button = this.shadowRoot.querySelector('button');
        if (button) {
            button.disabled = value;
        }
    }
}

// 🎯 Progress Ring Component
class ProgressRing extends HTMLElement {
    static get observedAttributes() {
        return ['progress', 'size', 'stroke', 'color'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const size = parseInt(this.getAttribute('size')) || 64;
        const stroke = parseInt(this.getAttribute('stroke')) || 4;
        const progress = parseFloat(this.getAttribute('progress')) || 0;
        const color = this.getAttribute('color') || '#667eea';
        
        const radius = (size - stroke) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;

        const template = `
            <style>
                :host {
                    display: inline-block;
                }
                
                svg {
                    transform: rotate(-90deg);
                    transition: all 0.3s ease;
                }
                
                .progress-bg {
                    fill: none;
                    stroke: #e5e7eb;
                }
                
                .progress-bar {
                    fill: none;
                    stroke: ${color};
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.5s ease;
                }
                
                .progress-text {
                    font-weight: 700;
                    font-size: ${size * 0.2}px;
                    text-anchor: middle;
                    dominant-baseline: middle;
                    fill: currentColor;
                    transform: rotate(90deg);
                }
            </style>
            
            <svg width="${size}" height="${size}">
                <circle class="progress-bg" 
                        cx="${size/2}" cy="${size/2}" r="${radius}" 
                        stroke-width="${stroke}"/>
                <circle class="progress-bar"
                        cx="${size/2}" cy="${size/2}" r="${radius}"
                        stroke-width="${stroke}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"/>
                <text class="progress-text" x="${size/2}" y="${size/2}">
                    ${Math.round(progress)}%
                </text>
            </svg>
        `;
        
        this.shadowRoot.innerHTML = template;
    }
}

// 🏭 Export all components
export const MODERN_COMPONENTS = {
    ApplicationCard,
    StatsWidget,
    FileDropzone,
    SmartButton,
    ProgressRing
};

export function createModernWebComponents(options) {
    return new ModernWebComponents(options);
}

// 🌐 Auto-initialize if in browser
if (typeof window !== 'undefined') {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.modernComponents = createModernWebComponents();
        });
    } else {
        window.modernComponents = createModernWebComponents();
    }
}
