// 🔔 Notification Center - Advanced Benachrichtigungssystem
// Toast Notifications, Push Notifications und Smart Alerts

export class NotificationCenter {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            position: options.position || 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
            maxNotifications: options.maxNotifications || 5,
            autoHideDuration: options.autoHideDuration || 5000,
            enableSound: options.enableSound || false,
            enablePersistentNotifications: options.enablePersistentNotifications || false,
            enableDesktopNotifications: options.enableDesktopNotifications || false,
            enableEmailNotifications: options.enableEmailNotifications || false,
            ...options
        };

        this.notifications = new Map();
        this.notificationQueue = [];
        this.persistentNotifications = [];
        this.notificationContainer = null;
        this.soundEnabled = false;
        this.permissionGranted = false;
        
        this.isInitialized = false;
    }

    async init() {
        try {
            this.setupNotificationContainer();
            await this.requestPermissions();
            this.setupEventListeners();
            this.loadPersistentNotifications();
            
            // Subscribe to application events
            this.applicationCore.subscribe((event, data) => {
                this.handleApplicationEvent(event, data);
            });
            
            this.isInitialized = true;
            console.log('✅ NotificationCenter initialized');
        } catch (error) {
            console.error('❌ NotificationCenter initialization failed:', error);
            throw error;
        }
    }

    setupNotificationContainer() {
        // Create notification container if it doesn't exist
        this.notificationContainer = document.querySelector('.notification-container');
        
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = `notification-container position-${this.options.position}`;
            document.body.appendChild(this.notificationContainer);
        }
        
        // Inject styles if needed
        if (!document.querySelector('#notification-styles')) {
            this.injectStyles();
        }
    }

    async requestPermissions() {
        // Request desktop notification permission
        if (this.options.enableDesktopNotifications && 'Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                this.permissionGranted = permission === 'granted';
                
                if (this.permissionGranted) {
                    console.log('✅ Desktop notification permission granted');
                } else {
                    console.log('⚠️ Desktop notification permission denied');
                }
            } catch (error) {
                console.error('❌ Error requesting notification permission:', error);
            }
        }

        // Audio permission (user gesture required)
        if (this.options.enableSound) {
            this.setupSoundSystem();
        }
    }

    setupSoundSystem() {
        // Create audio context for notification sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = true;
            
            // Create notification sound
            this.createNotificationSound();
        } catch (error) {
            console.warn('Audio notifications not available:', error);
        }
    }

    createNotificationSound() {
        // Simple notification beep
        this.notificationBeep = () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    // 📨 Notification Methods
    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateNotificationId(),
            message,
            type,
            timestamp: new Date().toISOString(),
            persistent: options.persistent || false,
            actions: options.actions || [],
            data: options.data || {},
            ...options
        };

        // Add to notifications map
        this.notifications.set(notification.id, notification);

        // Render notification
        this.renderNotification(notification);

        // Play sound if enabled
        if (this.soundEnabled && this.notificationBeep) {
            this.notificationBeep();
        }

        // Show desktop notification
        if (this.options.enableDesktopNotifications && this.permissionGranted) {
            this.showDesktopNotification(notification);
        }

        // Auto-hide if not persistent
        if (!notification.persistent && this.options.autoHideDuration > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, this.options.autoHideDuration);
        }

        // Manage notification count
        this.manageNotificationCount();

        return notification.id;
    }

    renderNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.type} ${notification.persistent ? 'persistent' : ''}`;
        notificationElement.dataset.id = notification.id;
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-body">
                    <div class="notification-message">${notification.message}</div>
                    ${notification.description ? `<div class="notification-description">${notification.description}</div>` : ''}
                    ${notification.actions.length > 0 ? this.getNotificationActionsHTML(notification) : ''}
                </div>
                <div class="notification-controls">
                    ${notification.persistent ? '' : '<div class="notification-timer"></div>'}
                    <button class="notification-close" onclick="notificationCenter.hide('${notification.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Add animation
        notificationElement.style.animation = 'slideInRight 0.3s ease-out';

        this.notificationContainer.appendChild(notificationElement);

        // Start timer animation if not persistent
        if (!notification.persistent && this.options.autoHideDuration > 0) {
            const timer = notificationElement.querySelector('.notification-timer');
            if (timer) {
                timer.style.animation = `timerProgress ${this.options.autoHideDuration}ms linear`;
            }
        }
    }

    getNotificationActionsHTML(notification) {
        return `
            <div class="notification-actions">
                ${notification.actions.map(action => `
                    <button class="notification-action ${action.type || 'default'}" 
                            onclick="notificationCenter.executeNotificationAction('${notification.id}', '${action.id}')">
                        ${action.icon ? `<i class="fas ${action.icon}"></i>` : ''}
                        <span>${action.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    hide(notificationId) {
        const notificationElement = this.notificationContainer.querySelector(`[data-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.remove();
                }
            }, 300);
        }

        this.notifications.delete(notificationId);
    }

    hideAll() {
        this.notifications.clear();
        this.notificationContainer.innerHTML = '';
    }

    // 🖥️ Desktop Notifications
    showDesktopNotification(notification) {
        if (!this.permissionGranted) return;

        try {
            const desktopNotification = new Notification(notification.message, {
                body: notification.description || '',
                icon: '/favicon.ico',
                tag: notification.id,
                silent: !this.options.enableSound,
                data: notification.data
            });

            desktopNotification.onclick = () => {
                window.focus();
                this.handleDesktopNotificationClick(notification);
                desktopNotification.close();
            };

            // Auto-close desktop notification
            setTimeout(() => {
                desktopNotification.close();
            }, this.options.autoHideDuration);

        } catch (error) {
            console.error('Desktop notification failed:', error);
        }
    }

    handleDesktopNotificationClick(notification) {
        // Handle click on desktop notification
        if (notification.data?.applicationId) {
            this.viewApplication(notification.data.applicationId);
        }
    }

    // 🎭 Event Handling
    handleApplicationEvent(event, data) {
        const notificationMap = {
            'applicationCreated': {
                message: '✅ Bewerbung erfolgreich erstellt',
                description: `Bewerbung bei ${data.company} für ${data.position}`,
                type: 'success',
                actions: [
                    {
                        id: 'view',
                        label: 'Ansehen',
                        icon: 'fa-eye',
                        type: 'primary'
                    }
                ],
                data: { applicationId: data.id }
            },
            'applicationUpdated': {
                message: 'Bewerbung aktualisiert',
                description: `Status geändert zu: ${this.getStatusText(data.status)}`,
                type: 'info',
                data: { applicationId: data.id }
            },
            'uploadCompleted': {
                message: '📤 Upload erfolgreich',
                description: `Datei "${data.file?.name}" hochgeladen`,
                type: 'success'
            },
            'uploadFailed': {
                message: '❌ Upload fehlgeschlagen',
                description: `Fehler beim Upload von "${data.file?.name}"`,
                type: 'error',
                actions: [
                    {
                        id: 'retry',
                        label: 'Wiederholen',
                        icon: 'fa-redo',
                        type: 'warning'
                    }
                ]
            }
        };

        const notificationTemplate = notificationMap[event];
        if (notificationTemplate) {
            this.show(
                notificationTemplate.message,
                notificationTemplate.type,
                {
                    description: notificationTemplate.description,
                    actions: notificationTemplate.actions || [],
                    data: notificationTemplate.data || {}
                }
            );
        }
    }

    executeNotificationAction(notificationId, actionId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        switch (actionId) {
            case 'view':
                if (notification.data?.applicationId) {
                    this.viewApplication(notification.data.applicationId);
                }
                break;
            case 'retry':
                // Handle retry logic
                console.log(`Retrying action for notification: ${notificationId}`);
                break;
        }

        // Hide notification after action
        this.hide(notificationId);
    }

    // 🛠️ Utility Methods
    getNotificationIcon(type) {
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return iconMap[type] || 'fa-info-circle';
    }

    generateNotificationId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    manageNotificationCount() {
        const visibleNotifications = this.notificationContainer.children;
        
        if (visibleNotifications.length > this.options.maxNotifications) {
            // Remove oldest notifications
            const excess = visibleNotifications.length - this.options.maxNotifications;
            for (let i = 0; i < excess; i++) {
                const oldest = visibleNotifications[visibleNotifications.length - 1 - i];
                if (oldest && !oldest.classList.contains('persistent')) {
                    const id = oldest.dataset.id;
                    this.hide(id);
                }
            }
        }
    }

    loadPersistentNotifications() {
        if (!this.options.enablePersistentNotifications) return;
        
        try {
            const stored = localStorage.getItem('persistent_notifications');
            if (stored) {
                this.persistentNotifications = JSON.parse(stored);
                
                // Re-render persistent notifications
                this.persistentNotifications.forEach(notification => {
                    this.renderNotification(notification);
                });
            }
        } catch (error) {
            console.error('Error loading persistent notifications:', error);
        }
    }

    savePersistentNotifications() {
        if (!this.options.enablePersistentNotifications) return;
        
        try {
            localStorage.setItem('persistent_notifications', JSON.stringify(this.persistentNotifications));
        } catch (error) {
            console.error('Error saving persistent notifications:', error);
        }
    }

    // 🎨 Style Injection
    injectStyles() {
        const styles = `
            <style id="notification-styles">
            .notification-container {
                position: fixed;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 400px;
                pointer-events: none;
            }

            .notification-container.position-top-right {
                top: 2rem;
                right: 2rem;
            }

            .notification-container.position-top-left {
                top: 2rem;
                left: 2rem;
            }

            .notification-container.position-bottom-right {
                bottom: 2rem;
                right: 2rem;
            }

            .notification-container.position-bottom-left {
                bottom: 2rem;
                left: 2rem;
            }

            .notification {
                pointer-events: all;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                border-left: 4px solid;
                overflow: hidden;
                position: relative;
            }

            .notification-success { border-left-color: #10b981; }
            .notification-error { border-left-color: #ef4444; }
            .notification-warning { border-left-color: #f59e0b; }
            .notification-info { border-left-color: #3b82f6; }

            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 1rem;
                gap: 0.75rem;
            }

            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 0.875rem;
            }

            .notification-success .notification-icon {
                background: #dcfce7;
                color: #166534;
            }

            .notification-error .notification-icon {
                background: #fef2f2;
                color: #991b1b;
            }

            .notification-warning .notification-icon {
                background: #fef3c7;
                color: #92400e;
            }

            .notification-info .notification-icon {
                background: #dbeafe;
                color: #1e40af;
            }

            .notification-body {
                flex: 1;
                min-width: 0;
            }

            .notification-message {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.25rem;
            }

            .notification-description {
                font-size: 0.875rem;
                color: #6b7280;
                line-height: 1.4;
            }

            .notification-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.75rem;
            }

            .notification-action {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.375rem 0.75rem;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notification-action:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }

            .notification-action.primary {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }

            .notification-action.primary:hover {
                background: #2563eb;
            }

            .notification-controls {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.5rem;
            }

            .notification-timer {
                width: 3px;
                height: 20px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }

            .notification-timer::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #6b7280;
                transform: scaleY(0);
                transform-origin: top;
            }

            .notification-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
            }

            .notification-close:hover {
                background: #f3f4f6;
                color: #6b7280;
            }

            .notification.persistent {
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                border: 2px solid;
            }

            .notification.persistent.notification-success {
                border-color: #10b981;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes timerProgress {
                from {
                    transform: scaleY(1);
                }
                to {
                    transform: scaleY(0);
                }
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .notification-container {
                    left: 1rem;
                    right: 1rem;
                    max-width: none;
                }
                
                .notification-container.position-top-right,
                .notification-container.position-top-left {
                    top: 1rem;
                    left: 1rem;
                    right: 1rem;
                }
                
                .notification-container.position-bottom-right,
                .notification-container.position-bottom-left {
                    bottom: 1rem;
                    left: 1rem;
                    right: 1rem;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // 🔧 Event Listeners
    setupEventListeners() {
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Check for missed notifications when user returns
                this.checkMissedNotifications();
            }
        });
    }

    async checkMissedNotifications() {
        // This would check for server-side notifications that occurred while user was away
        if (this.options.dashboard?.modules?.api) {
            try {
                // const missedNotifications = await this.options.dashboard.modules.api.getMissedNotifications();
                // Handle missed notifications
            } catch (error) {
                console.error('Error checking missed notifications:', error);
            }
        }
    }

    // 📊 Convenience Methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { persistent: true, ...options });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // 🧹 Cleanup
    destroy() {
        this.hideAll();
        
        if (this.notificationContainer) {
            this.notificationContainer.remove();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.notifications.clear();
        this.isInitialized = false;
    }
}

// Global reference
window.notificationCenter = null;
export function setGlobalNotificationCenter(instance) {
    window.notificationCenter = instance;
}
