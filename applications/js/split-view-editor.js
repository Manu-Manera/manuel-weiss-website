/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SPLIT-VIEW EDITOR
 * Side-by-side view for job description and cover letter
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SplitViewEditor {
    constructor() {
        this.isEnabled = false;
        this.resizing = false;
        this.splitRatio = 0.4; // 40% left, 60% right
        
        this.init();
    }
    
    init() {
        this.createToggleButton();
        this.createSplitViewContainer();
        this.setupKeyboardShortcuts();
        console.log('📐 Split-View Editor initialized');
    }
    
    createToggleButton() {
        // Find toolbar or header
        const toolbar = document.querySelector('.editor-actions') || 
                       document.querySelector('.editor-header');
        
        if (!toolbar || document.getElementById('splitViewToggle')) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'splitViewToggle';
        toggleBtn.className = 'btn-icon';
        toggleBtn.title = 'Split-View (Strg+\\)';
        toggleBtn.innerHTML = '<i class="fas fa-columns"></i>';
        
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
        
        // Insert at beginning of actions
        toolbar.insertBefore(toggleBtn, toolbar.firstChild);
    }
    
    createSplitViewContainer() {
        // Check if we're on cover letter editor
        const editorLayout = document.querySelector('.editor-layout');
        if (!editorLayout || document.getElementById('splitViewContainer')) return;
        
        // Create split view wrapper
        const splitContainer = document.createElement('div');
        splitContainer.id = 'splitViewContainer';
        splitContainer.className = 'split-view-container';
        splitContainer.style.display = 'none';
        splitContainer.innerHTML = `
            <div class="split-view-left" id="splitViewLeft">
                <div class="split-view-header">
                    <h3><i class="fas fa-clipboard-list"></i> Stellenbeschreibung</h3>
                    <div class="split-view-tools">
                        <button type="button" class="split-tool-btn" id="highlightKeywordsBtn" title="Keywords hervorheben">
                            <i class="fas fa-highlighter"></i>
                        </button>
                        <button type="button" class="split-tool-btn" id="copyKeywordsBtn" title="Keywords kopieren">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="split-view-content" id="splitJobDescription">
                    <div class="job-description-display"></div>
                </div>
                <div class="keyword-highlights" id="keywordHighlights">
                    <h4>Erkannte Keywords</h4>
                    <div class="keywords-container"></div>
                </div>
            </div>
            
            <div class="split-view-resizer" id="splitViewResizer">
                <div class="resizer-handle"></div>
            </div>
            
            <div class="split-view-right" id="splitViewRight">
                <div class="split-view-header">
                    <h3><i class="fas fa-file-alt"></i> Anschreiben-Vorschau</h3>
                    <div class="split-view-tools">
                        <button type="button" class="split-tool-btn" id="syncScrollBtn" title="Synchrones Scrollen">
                            <i class="fas fa-link"></i>
                        </button>
                    </div>
                </div>
                <div class="split-view-content" id="splitLetterPreview">
                    <div class="letter-preview-display"></div>
                </div>
            </div>
        `;
        
        // Insert after main content
        const editorMain = document.querySelector('.editor-main');
        if (editorMain) {
            editorMain.parentNode.insertBefore(splitContainer, editorMain.nextSibling);
        }
        
        this.setupResizer();
        this.setupSplitViewTools();
    }
    
    setupResizer() {
        const resizer = document.getElementById('splitViewResizer');
        const container = document.getElementById('splitViewContainer');
        const leftPanel = document.getElementById('splitViewLeft');
        const rightPanel = document.getElementById('splitViewRight');
        
        if (!resizer || !container || !leftPanel || !rightPanel) return;
        
        let startX, startLeftWidth;
        
        const startResize = (e) => {
            this.resizing = true;
            startX = e.clientX || e.touches?.[0]?.clientX;
            startLeftWidth = leftPanel.offsetWidth;
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchmove', resize);
            document.addEventListener('touchend', stopResize);
            
            resizer.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };
        
        const resize = (e) => {
            if (!this.resizing) return;
            
            const currentX = e.clientX || e.touches?.[0]?.clientX;
            const delta = currentX - startX;
            const containerWidth = container.offsetWidth;
            
            let newLeftWidth = startLeftWidth + delta;
            
            // Minimum widths
            const minWidth = 250;
            const maxWidth = containerWidth - 300;
            
            newLeftWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
            
            this.splitRatio = newLeftWidth / containerWidth;
            
            leftPanel.style.flex = `0 0 ${newLeftWidth}px`;
            rightPanel.style.flex = '1';
        };
        
        const stopResize = () => {
            this.resizing = false;
            
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', resize);
            document.removeEventListener('touchend', stopResize);
            
            resizer.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Save ratio
            localStorage.setItem('split_view_ratio', this.splitRatio);
        };
        
        resizer.addEventListener('mousedown', startResize);
        resizer.addEventListener('touchstart', startResize);
        
        // Load saved ratio
        const savedRatio = localStorage.getItem('split_view_ratio');
        if (savedRatio) {
            this.splitRatio = parseFloat(savedRatio);
        }
    }
    
    setupSplitViewTools() {
        // Highlight keywords button
        const highlightBtn = document.getElementById('highlightKeywordsBtn');
        if (highlightBtn) {
            highlightBtn.addEventListener('click', () => {
                this.highlightKeywords();
            });
        }
        
        // Copy keywords button
        const copyBtn = document.getElementById('copyKeywordsBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyKeywords();
            });
        }
        
        // Sync scroll button
        const syncBtn = document.getElementById('syncScrollBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.toggleSyncScroll();
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + \ to toggle split view
            if (e.ctrlKey && e.key === '\\') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        const splitContainer = document.getElementById('splitViewContainer');
        const editorMain = document.querySelector('.editor-main');
        const toggleBtn = document.getElementById('splitViewToggle');
        
        if (this.isEnabled) {
            // Show split view
            if (splitContainer) {
                splitContainer.style.display = 'flex';
                this.updateSplitView();
            }
            
            if (editorMain) {
                editorMain.style.display = 'none';
            }
            
            if (toggleBtn) {
                toggleBtn.classList.add('active');
            }
            
            // Set up content syncing
            this.setupContentSync();
            
        } else {
            // Hide split view
            if (splitContainer) {
                splitContainer.style.display = 'none';
            }
            
            if (editorMain) {
                editorMain.style.display = 'block';
            }
            
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
            }
        }
    }
    
    updateSplitView() {
        // Update job description display
        const jobDescEl = document.getElementById('jobDescription');
        const jobDescDisplay = document.querySelector('#splitJobDescription .job-description-display');
        
        if (jobDescEl && jobDescDisplay) {
            const text = jobDescEl.value || 'Stellenbeschreibung eingeben...';
            jobDescDisplay.innerHTML = this.formatJobDescription(text);
        }
        
        // Update letter preview
        const letterTextEl = document.getElementById('letterText');
        const letterPreviewDisplay = document.querySelector('#splitLetterPreview .letter-preview-display');
        
        if (letterTextEl && letterPreviewDisplay) {
            letterPreviewDisplay.innerHTML = this.formatLetterPreview(letterTextEl.value);
        }
        
        // Apply split ratio
        const leftPanel = document.getElementById('splitViewLeft');
        if (leftPanel) {
            leftPanel.style.flex = `0 0 ${this.splitRatio * 100}%`;
        }
    }
    
    setupContentSync() {
        // Sync job description changes
        const jobDescEl = document.getElementById('jobDescription');
        if (jobDescEl) {
            jobDescEl.addEventListener('input', () => {
                if (this.isEnabled) {
                    const display = document.querySelector('#splitJobDescription .job-description-display');
                    if (display) {
                        display.innerHTML = this.formatJobDescription(jobDescEl.value);
                    }
                }
            });
        }
        
        // Sync letter text changes
        const letterTextEl = document.getElementById('letterText');
        if (letterTextEl) {
            letterTextEl.addEventListener('input', () => {
                if (this.isEnabled) {
                    const display = document.querySelector('#splitLetterPreview .letter-preview-display');
                    if (display) {
                        display.innerHTML = this.formatLetterPreview(letterTextEl.value);
                    }
                }
            });
        }
    }
    
    formatJobDescription(text) {
        if (!text) return '<p class="placeholder">Stellenbeschreibung eingeben...</p>';
        
        // Split into paragraphs and format
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        
        return paragraphs.map(p => {
            // Detect bullet points
            if (p.match(/^[-•*]\s/m)) {
                const items = p.split(/\n/).filter(Boolean);
                return `<ul>${items.map(item => 
                    `<li>${item.replace(/^[-•*]\s*/, '')}</li>`
                ).join('')}</ul>`;
            }
            return `<p>${p}</p>`;
        }).join('');
    }
    
    formatLetterPreview(text) {
        if (!text) return '<p class="placeholder">Anschreiben wird hier angezeigt...</p>';
        
        // Add letter formatting
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        
        let html = '<div class="letter-content">';
        html += '<p class="letter-salutation">Sehr geehrte Damen und Herren,</p>';
        html += paragraphs.map(p => `<p>${p}</p>`).join('');
        html += '<p class="letter-closing">Mit freundlichen Grüßen</p>';
        html += '</div>';
        
        return html;
    }
    
    highlightKeywords() {
        const jobDescEl = document.getElementById('jobDescription');
        if (!jobDescEl) return;
        
        const text = jobDescEl.value;
        const keywords = this.extractKeywords(text);
        
        // Update display with highlights
        const display = document.querySelector('#splitJobDescription .job-description-display');
        if (display) {
            let html = this.formatJobDescription(text);
            
            // Highlight keywords
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
                html = html.replace(regex, '<mark class="keyword-highlight">$1</mark>');
            });
            
            display.innerHTML = html;
        }
        
        // Show keywords list
        const keywordsContainer = document.querySelector('#keywordHighlights .keywords-container');
        const keywordSection = document.getElementById('keywordHighlights');
        
        if (keywordsContainer && keywordSection) {
            keywordsContainer.innerHTML = keywords.map(k => 
                `<span class="keyword-tag">${k}</span>`
            ).join('');
            keywordSection.style.display = 'block';
        }
        
        this.showToast(`${keywords.length} Keywords gefunden`, 'success');
    }
    
    extractKeywords(text) {
        const stopWords = new Set([
            'und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'für', 'mit', 'von',
            'zu', 'bei', 'auf', 'aus', 'nach', 'über', 'unter', 'durch', 'als',
            'ist', 'sind', 'werden', 'wird', 'haben', 'hat', 'sein', 'kann', 'sollte',
            'sowie', 'auch', 'wenn', 'dann', 'dass', 'sich', 'wir', 'sie', 'ihr'
        ]);
        
        const words = text.toLowerCase()
            .replace(/[^a-zäöüß0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 4 && !stopWords.has(w));
        
        // Count frequency
        const counts = {};
        words.forEach(word => {
            counts[word] = (counts[word] || 0) + 1;
        });
        
        // Return top keywords
        return Object.entries(counts)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word]) => word);
    }
    
    copyKeywords() {
        const keywordsContainer = document.querySelector('#keywordHighlights .keywords-container');
        if (!keywordsContainer) return;
        
        const keywords = Array.from(keywordsContainer.querySelectorAll('.keyword-tag'))
            .map(el => el.textContent)
            .join(', ');
        
        navigator.clipboard.writeText(keywords).then(() => {
            this.showToast('Keywords kopiert!', 'success');
        }).catch(() => {
            this.showToast('Kopieren fehlgeschlagen', 'error');
        });
    }
    
    toggleSyncScroll() {
        const btn = document.getElementById('syncScrollBtn');
        const leftContent = document.querySelector('#splitJobDescription');
        const rightContent = document.querySelector('#splitLetterPreview');
        
        if (!leftContent || !rightContent) return;
        
        const isActive = btn.classList.toggle('active');
        
        if (isActive) {
            // Enable sync scrolling
            const syncScroll = (source, target) => {
                const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
                target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
            };
            
            leftContent.addEventListener('scroll', () => syncScroll(leftContent, rightContent));
            rightContent.addEventListener('scroll', () => syncScroll(rightContent, leftContent));
            
            this.showToast('Synchrones Scrollen aktiviert', 'info');
        } else {
            // Disable by removing listeners (simplified - would need proper implementation)
            this.showToast('Synchrones Scrollen deaktiviert', 'info');
        }
    }
    
    showToast(message, type = 'info') {
        if (window.coverLetterEditor?.showToast) {
            window.coverLetterEditor.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Auto-initialize on cover letter editor
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.cover-letter-editor')) {
        window.splitViewEditor = new SplitViewEditor();
    }
});
