/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COLLABORATION MODULE
 * Share resumes/cover letters and receive feedback
 * ═══════════════════════════════════════════════════════════════════════════
 */

class CollaborationModule {
    constructor() {
        this.shareBaseUrl = window.location.origin;
        this.comments = [];
        
        this.init();
    }
    
    init() {
        this.createShareButton();
        this.createFeedbackPanel();
        this.checkForSharedView();
        console.log('👥 Collaboration Module initialized');
    }
    
    createShareButton() {
        // Find action buttons area
        const actionArea = document.querySelector('.editor-actions') ||
                          document.querySelector('.resume-actions');
        
        if (!actionArea || document.getElementById('shareBtn')) return;
        
        const shareBtn = document.createElement('button');
        shareBtn.id = 'shareBtn';
        shareBtn.className = 'btn-secondary';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Teilen';
        shareBtn.title = 'Dokument zur Überprüfung teilen';
        
        shareBtn.addEventListener('click', () => this.openShareModal());
        
        actionArea.appendChild(shareBtn);
    }
    
    createFeedbackPanel() {
        // Create feedback panel for shared view
        if (document.getElementById('feedbackPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'feedbackPanel';
        panel.className = 'feedback-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="feedback-header">
                <h3><i class="fas fa-comments"></i> Feedback</h3>
                <button class="feedback-toggle" id="feedbackToggle">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="feedback-body">
                <div class="feedback-comments" id="feedbackComments">
                    <!-- Comments will be rendered here -->
                </div>
                <div class="feedback-form">
                    <div class="form-group">
                        <input type="text" id="feedbackName" placeholder="Ihr Name" />
                    </div>
                    <div class="form-group">
                        <textarea id="feedbackText" placeholder="Ihr Feedback..." rows="3"></textarea>
                    </div>
                    <button type="button" class="btn-primary" id="submitFeedbackBtn">
                        <i class="fas fa-paper-plane"></i> Feedback senden
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Event listeners
        document.getElementById('feedbackToggle').addEventListener('click', () => {
            panel.classList.toggle('expanded');
        });
        
        document.getElementById('submitFeedbackBtn').addEventListener('click', () => {
            this.submitFeedback();
        });
    }
    
    openShareModal() {
        // Create share modal
        let modal = document.getElementById('shareModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareModal';
            modal.className = 'share-modal';
            modal.innerHTML = `
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h2><i class="fas fa-share-alt"></i> Dokument teilen</h2>
                        <button class="share-close" id="shareCloseBtn">&times;</button>
                    </div>
                    <div class="share-modal-body">
                        <div class="share-options">
                            <h4>Zugriffsrechte</h4>
                            <div class="option-group">
                                <label class="option-radio">
                                    <input type="radio" name="shareAccess" value="view" checked>
                                    <span class="radio-custom"></span>
                                    <span class="option-label">
                                        <i class="fas fa-eye"></i>
                                        Nur ansehen
                                    </span>
                                </label>
                                <label class="option-radio">
                                    <input type="radio" name="shareAccess" value="comment">
                                    <span class="radio-custom"></span>
                                    <span class="option-label">
                                        <i class="fas fa-comment"></i>
                                        Ansehen & Kommentieren
                                    </span>
                                </label>
                            </div>
                            
                            <h4>Gültigkeitsdauer</h4>
                            <select id="shareDuration" class="share-duration">
                                <option value="24">24 Stunden</option>
                                <option value="72" selected>3 Tage</option>
                                <option value="168">1 Woche</option>
                                <option value="720">30 Tage</option>
                            </select>
                            
                            <div class="password-option">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="sharePassword">
                                    <span>Mit Passwort schützen</span>
                                </label>
                                <input type="password" id="sharePasswordInput" placeholder="Passwort eingeben" style="display: none;">
                            </div>
                        </div>
                        
                        <div class="share-link-section" style="display: none;">
                            <h4>Freigabelink</h4>
                            <div class="share-link-box">
                                <input type="text" id="shareLinkInput" readonly>
                                <button type="button" id="copyShareLink" class="btn-icon" title="Link kopieren">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="share-actions">
                                <button type="button" class="btn-icon" id="shareEmail" title="Per E-Mail teilen">
                                    <i class="fas fa-envelope"></i>
                                </button>
                                <button type="button" class="btn-icon" id="shareWhatsApp" title="Per WhatsApp teilen">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                                <button type="button" class="btn-icon" id="shareLinkedIn" title="Per LinkedIn teilen">
                                    <i class="fab fa-linkedin"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button type="button" class="btn-primary" id="generateShareLink">
                            <i class="fas fa-link"></i> Link erstellen
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listeners
            document.getElementById('shareCloseBtn').addEventListener('click', () => {
                this.closeShareModal();
            });
            
            document.getElementById('sharePassword').addEventListener('change', (e) => {
                document.getElementById('sharePasswordInput').style.display = 
                    e.target.checked ? 'block' : 'none';
            });
            
            document.getElementById('generateShareLink').addEventListener('click', () => {
                this.generateShareLink();
            });
            
            document.getElementById('copyShareLink').addEventListener('click', () => {
                this.copyShareLink();
            });
            
            document.getElementById('shareEmail').addEventListener('click', () => {
                this.shareViaEmail();
            });
            
            document.getElementById('shareWhatsApp').addEventListener('click', () => {
                this.shareViaWhatsApp();
            });
            
            document.getElementById('shareLinkedIn').addEventListener('click', () => {
                this.shareViaLinkedIn();
            });
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeShareModal();
            });
        }
        
        modal.classList.add('active');
    }
    
    closeShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) modal.classList.remove('active');
    }
    
    async generateShareLink() {
        const access = document.querySelector('input[name="shareAccess"]:checked')?.value || 'view';
        const duration = document.getElementById('shareDuration')?.value || 72;
        const usePassword = document.getElementById('sharePassword')?.checked;
        const password = document.getElementById('sharePasswordInput')?.value;
        
        // Collect current document data
        const documentData = this.collectDocumentData();
        
        // Generate unique share ID
        const shareId = this.generateShareId();
        
        // Create share object
        const shareData = {
            id: shareId,
            access,
            expiresAt: Date.now() + (parseInt(duration) * 60 * 60 * 1000),
            password: usePassword ? this.hashPassword(password) : null,
            document: documentData,
            createdAt: Date.now(),
            views: 0,
            comments: []
        };
        
        // Save to storage (localStorage for demo, would be cloud in production)
        this.saveShareData(shareData);
        
        // Generate link
        const shareLink = `${this.shareBaseUrl}/applications/shared.html?id=${shareId}`;
        
        // Show link
        const linkInput = document.getElementById('shareLinkInput');
        const linkSection = document.querySelector('.share-link-section');
        
        if (linkInput && linkSection) {
            linkInput.value = shareLink;
            linkSection.style.display = 'block';
        }
        
        this.showToast('Freigabelink erstellt!', 'success');
    }
    
    collectDocumentData() {
        // Determine document type
        const isResume = !!document.getElementById('resumeForm');
        const isCoverLetter = !!document.getElementById('letterText');
        
        if (isResume) {
            // Collect resume data
            return {
                type: 'resume',
                data: window.resumeEditor?.collectFormData() || this.collectResumeFormData()
            };
        } else if (isCoverLetter) {
            // Collect cover letter data
            return {
                type: 'coverLetter',
                data: {
                    text: document.getElementById('letterText')?.value || '',
                    jobData: window.coverLetterEditor?.jobData || {},
                    design: window.coverLetterEditor?.design || {}
                }
            };
        }
        
        return { type: 'unknown', data: {} };
    }
    
    collectResumeFormData() {
        // Basic fallback data collection
        return {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            title: document.getElementById('title')?.value || '',
            summary: document.getElementById('summary')?.value || ''
        };
    }
    
    generateShareId() {
        return 'share_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    hashPassword(password) {
        // Simple hash for demo - in production use proper crypto
        if (!password) return null;
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    saveShareData(data) {
        const shares = JSON.parse(localStorage.getItem('shared_documents') || '{}');
        shares[data.id] = data;
        localStorage.setItem('shared_documents', JSON.stringify(shares));
    }
    
    getShareData(shareId) {
        const shares = JSON.parse(localStorage.getItem('shared_documents') || '{}');
        return shares[shareId];
    }
    
    copyShareLink() {
        const linkInput = document.getElementById('shareLinkInput');
        if (linkInput) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                this.showToast('Link kopiert!', 'success');
            }).catch(() => {
                linkInput.select();
                document.execCommand('copy');
                this.showToast('Link kopiert!', 'success');
            });
        }
    }
    
    shareViaEmail() {
        const link = document.getElementById('shareLinkInput')?.value;
        if (!link) return;
        
        const subject = encodeURIComponent('Bitte um Feedback zu meiner Bewerbung');
        const body = encodeURIComponent(
            `Hallo,\n\nkönntest du bitte einen Blick auf meine Bewerbungsunterlagen werfen und mir Feedback geben?\n\nHier ist der Link: ${link}\n\nVielen Dank!`
        );
        
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
    
    shareViaWhatsApp() {
        const link = document.getElementById('shareLinkInput')?.value;
        if (!link) return;
        
        const text = encodeURIComponent(
            `Hey! Kannst du dir meine Bewerbungsunterlagen anschauen und mir Feedback geben? 📝\n\n${link}`
        );
        
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
    
    shareViaLinkedIn() {
        const link = document.getElementById('shareLinkInput')?.value;
        if (!link) return;
        
        const url = encodeURIComponent(link);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }
    
    checkForSharedView() {
        // Check if we're on a shared view page
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('id');
        
        if (shareId && window.location.pathname.includes('shared.html')) {
            this.loadSharedDocument(shareId);
        }
    }
    
    loadSharedDocument(shareId) {
        const shareData = this.getShareData(shareId);
        
        if (!shareData) {
            this.showError('Dokument nicht gefunden oder abgelaufen.');
            return;
        }
        
        // Check expiration
        if (Date.now() > shareData.expiresAt) {
            this.showError('Der Freigabelink ist abgelaufen.');
            return;
        }
        
        // Check password if required
        if (shareData.password) {
            this.showPasswordPrompt(shareData);
            return;
        }
        
        // Display the shared document
        this.displaySharedDocument(shareData);
    }
    
    showPasswordPrompt(shareData) {
        const container = document.getElementById('sharedDocumentContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="password-prompt">
                <i class="fas fa-lock"></i>
                <h2>Dieses Dokument ist passwortgeschützt</h2>
                <div class="password-form">
                    <input type="password" id="sharePasswordCheck" placeholder="Passwort eingeben">
                    <button type="button" class="btn-primary" id="checkPasswordBtn">
                        <i class="fas fa-unlock"></i> Entsperren
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('checkPasswordBtn').addEventListener('click', () => {
            const enteredPassword = document.getElementById('sharePasswordCheck')?.value;
            const hash = this.hashPassword(enteredPassword);
            
            if (hash === shareData.password) {
                this.displaySharedDocument(shareData);
            } else {
                this.showToast('Falsches Passwort', 'error');
            }
        });
    }
    
    displaySharedDocument(shareData) {
        const container = document.getElementById('sharedDocumentContainer');
        if (!container) return;
        
        // Increment view count
        shareData.views++;
        this.saveShareData(shareData);
        
        // Load comments
        this.comments = shareData.comments || [];
        
        // Show feedback panel if commenting is allowed
        if (shareData.access === 'comment') {
            const panel = document.getElementById('feedbackPanel');
            if (panel) panel.style.display = 'block';
            this.renderComments();
        }
        
        // Render document based on type
        if (shareData.document.type === 'resume') {
            this.renderSharedResume(shareData.document.data, container);
        } else if (shareData.document.type === 'coverLetter') {
            this.renderSharedCoverLetter(shareData.document.data, container);
        }
        
        // Store current share ID for feedback
        this.currentShareId = shareData.id;
    }
    
    renderSharedResume(data, container) {
        container.innerHTML = `
            <div class="shared-resume">
                <div class="shared-header">
                    <h1>${data.firstName || ''} ${data.lastName || ''}</h1>
                    <p class="title">${data.title || ''}</p>
                </div>
                <div class="shared-section">
                    <h2>Kurzprofil</h2>
                    <p>${data.summary || 'Kein Kurzprofil angegeben.'}</p>
                </div>
                <!-- Add more sections as needed -->
            </div>
        `;
    }
    
    renderSharedCoverLetter(data, container) {
        container.innerHTML = `
            <div class="shared-cover-letter">
                <div class="letter-paper">
                    <div class="letter-header">
                        <p class="date">${new Date().toLocaleDateString('de-DE')}</p>
                    </div>
                    <div class="letter-body">
                        ${data.text?.split('\n\n').map(p => `<p>${p}</p>`).join('') || 'Kein Inhalt.'}
                    </div>
                </div>
            </div>
        `;
    }
    
    submitFeedback() {
        const name = document.getElementById('feedbackName')?.value.trim();
        const text = document.getElementById('feedbackText')?.value.trim();
        
        if (!text) {
            this.showToast('Bitte geben Sie Feedback ein.', 'error');
            return;
        }
        
        const comment = {
            id: Date.now().toString(36),
            name: name || 'Anonym',
            text,
            createdAt: Date.now()
        };
        
        this.comments.push(comment);
        
        // Save to share data
        if (this.currentShareId) {
            const shareData = this.getShareData(this.currentShareId);
            if (shareData) {
                shareData.comments = this.comments;
                this.saveShareData(shareData);
            }
        }
        
        // Clear form
        document.getElementById('feedbackName').value = '';
        document.getElementById('feedbackText').value = '';
        
        // Re-render comments
        this.renderComments();
        
        this.showToast('Feedback gesendet!', 'success');
    }
    
    renderComments() {
        const container = document.getElementById('feedbackComments');
        if (!container) return;
        
        if (!this.comments.length) {
            container.innerHTML = '<p class="no-comments">Noch kein Feedback vorhanden.</p>';
            return;
        }
        
        container.innerHTML = this.comments.map(comment => `
            <div class="feedback-comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.name}</span>
                    <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `).join('');
    }
    
    showError(message) {
        const container = document.getElementById('sharedDocumentContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="share-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Fehler</h2>
                <p>${message}</p>
                <a href="dashboard.html" class="btn-primary">Zur Übersicht</a>
            </div>
        `;
    }
    
    showToast(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (window.coverLetterEditor?.showToast) {
            window.coverLetterEditor.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.collaborationModule = new CollaborationModule();
});
