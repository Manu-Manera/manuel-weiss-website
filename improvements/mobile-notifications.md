# Mobile App & Notifications Improvements - Vollständige Spezifikation

## Mobile Application - Detaillierte Implementierung

### 1. Progressive Web App (PWA) - Vollständige Konfiguration
```javascript
class PWAManager {
    constructor() {
        this.serviceWorker = null;
        this.pushManager = null;
        this.notificationPermission = null;
        this.installPrompt = null;
    }
    
    async initialize() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Initialize push notifications
        await this.initializePushNotifications();
        
        // Handle install prompt
        this.handleInstallPrompt();
        
        // Setup offline functionality
        this.setupOfflineSupport();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
                
                // Listen for updates
                this.serviceWorker.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate();
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    
    async initializePushNotifications() {
        if ('PushManager' in window) {
            this.pushManager = new PushManager();
            this.notificationPermission = await this.requestNotificationPermission();
            
            if (this.notificationPermission === 'granted') {
                await this.subscribeToPushNotifications();
            }
        }
    }
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            return await Notification.requestPermission();
        }
        return 'denied';
    }
    
    async subscribeToPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
            });
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            return subscription;
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }
    
    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });
            
            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }
        } catch (error) {
            console.error('Error sending subscription to server:', error);
        }
    }
    
    handleInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallButton();
        });
    }
    
    showInstallButton() {
        const installButton = document.createElement('button');
        installButton.textContent = 'Install App';
        installButton.className = 'install-button';
        installButton.addEventListener('click', () => {
            this.installPrompt.prompt();
            this.installPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                this.installPrompt = null;
            });
        });
        
        document.body.appendChild(installButton);
    }
    
    setupOfflineSupport() {
        // Cache critical resources
        this.cacheCriticalResources();
        
        // Setup offline data storage
        this.setupOfflineStorage();
        
        // Handle offline/online events
        this.handleConnectionEvents();
    }
    
    async cacheCriticalResources() {
        const criticalResources = [
            '/',
            '/css/main.css',
            '/js/main.js',
            '/icons/icon-192x192.png',
            '/icons/icon-512x512.png'
        ];
        
        const cache = await caches.open('critical-resources');
        await cache.addAll(criticalResources);
    }
    
    setupOfflineStorage() {
        // Use IndexedDB for offline data storage
        this.offlineDB = new OfflineDatabase();
        this.offlineDB.initialize();
    }
    
    handleConnectionEvents() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }
    
    async handleOnline() {
        console.log('Connection restored');
        // Sync offline data
        await this.syncOfflineData();
        // Show online indicator
        this.showConnectionStatus('online');
    }
    
    handleOffline() {
        console.log('Connection lost');
        // Show offline indicator
        this.showConnectionStatus('offline');
        // Enable offline mode
        this.enableOfflineMode();
    }
    
    async syncOfflineData() {
        try {
            const offlineData = await this.offlineDB.getAllData();
            for (const data of offlineData) {
                await this.syncDataToServer(data);
            }
            await this.offlineDB.clearData();
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }
    
    enableOfflineMode() {
        // Show offline message
        this.showOfflineMessage();
        // Disable real-time features
        this.disableRealTimeFeatures();
        // Enable offline features
        this.enableOfflineFeatures();
    }
    
    showOfflineMessage() {
        const offlineMessage = document.createElement('div');
        offlineMessage.className = 'offline-message';
        offlineMessage.textContent = 'You are offline. Some features may be limited.';
        document.body.appendChild(offlineMessage);
    }
    
    disableRealTimeFeatures() {
        // Stop real-time data updates
        this.stopRealTimeUpdates();
        // Disable push notifications
        this.disablePushNotifications();
    }
    
    enableOfflineFeatures() {
        // Enable cached data access
        this.enableCachedDataAccess();
        // Show offline indicators
        this.showOfflineIndicators();
    }
}
```

### 2. Mobile Features - Vollständige Implementierung
```javascript
class MobileFeatures {
    constructor() {
        this.touchGestures = new TouchGestureHandler();
        this.responsiveDesign = new ResponsiveDesignManager();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.batteryOptimizer = new BatteryOptimizer();
    }
    
    async initialize() {
        // Initialize touch gestures
        await this.touchGestures.initialize();
        
        // Setup responsive design
        await this.responsiveDesign.initialize();
        
        // Optimize performance
        await this.performanceOptimizer.initialize();
        
        // Optimize battery usage
        await this.batteryOptimizer.initialize();
    }
}

class TouchGestureHandler {
    constructor() {
        this.gestures = new Map();
        this.touchStart = null;
        this.touchEnd = null;
    }
    
    async initialize() {
        // Setup touch event listeners
        this.setupTouchListeners();
        
        // Register gesture handlers
        this.registerGestureHandlers();
    }
    
    setupTouchListeners() {
        document.addEventListener('touchstart', (e) => {
            this.touchStart = e.touches[0];
        });
        
        document.addEventListener('touchend', (e) => {
            this.touchEnd = e.changedTouches[0];
            this.handleTouchGesture();
        });
        
        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        });
    }
    
    handleTouchGesture() {
        if (!this.touchStart || !this.touchEnd) return;
        
        const deltaX = this.touchEnd.clientX - this.touchStart.clientX;
        const deltaY = this.touchEnd.clientY - this.touchStart.clientY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Determine gesture type
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 50) {
                this.handleSwipeRight();
            } else if (deltaX < -50) {
                this.handleSwipeLeft();
            }
        } else {
            if (deltaY > 50) {
                this.handleSwipeDown();
            } else if (deltaY < -50) {
                this.handleSwipeUp();
            }
        }
        
        // Reset touch points
        this.touchStart = null;
        this.touchEnd = null;
    }
    
    handleSwipeRight() {
        // Navigate to previous page
        this.navigateToPrevious();
    }
    
    handleSwipeLeft() {
        // Navigate to next page
        this.navigateToNext();
    }
    
    handleSwipeDown() {
        // Pull to refresh
        this.pullToRefresh();
    }
    
    handleSwipeUp() {
        // Show more options
        this.showMoreOptions();
    }
    
    handleTouchMove(e) {
        // Handle pinch gestures
        if (e.touches.length === 2) {
            this.handlePinchGesture(e);
        }
    }
    
    handlePinchGesture(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (distance > this.lastPinchDistance) {
            this.handlePinchOut();
        } else if (distance < this.lastPinchDistance) {
            this.handlePinchIn();
        }
        
        this.lastPinchDistance = distance;
    }
    
    handlePinchOut() {
        // Zoom in
        this.zoomIn();
    }
    
    handlePinchIn() {
        // Zoom out
        this.zoomOut();
    }
    
    registerGestureHandlers() {
        this.gestures.set('swipe-right', this.handleSwipeRight);
        this.gestures.set('swipe-left', this.handleSwipeLeft);
        this.gestures.set('swipe-down', this.handleSwipeDown);
        this.gestures.set('swipe-up', this.handleSwipeUp);
        this.gestures.set('pinch-out', this.handlePinchOut);
        this.gestures.set('pinch-in', this.handlePinchIn);
    }
}

class ResponsiveDesignManager {
    constructor() {
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        this.currentBreakpoint = null;
    }
    
    async initialize() {
        // Setup responsive breakpoints
        this.setupBreakpoints();
        
        // Setup responsive images
        this.setupResponsiveImages();
        
        // Setup responsive navigation
        this.setupResponsiveNavigation();
        
        // Setup responsive charts
        this.setupResponsiveCharts();
    }
    
    setupBreakpoints() {
        const mediaQueries = Object.entries(this.breakpoints).map(([name, width]) => {
            const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
            mediaQuery.addListener((e) => {
                if (e.matches) {
                    this.handleBreakpointChange(name);
                }
            });
            return { name, mediaQuery };
        });
        
        // Check initial breakpoint
        this.checkInitialBreakpoint();
    }
    
    handleBreakpointChange(breakpoint) {
        this.currentBreakpoint = breakpoint;
        
        // Update UI based on breakpoint
        this.updateUIForBreakpoint(breakpoint);
        
        // Update navigation
        this.updateNavigationForBreakpoint(breakpoint);
        
        // Update charts
        this.updateChartsForBreakpoint(breakpoint);
    }
    
    updateUIForBreakpoint(breakpoint) {
        const body = document.body;
        
        // Remove existing breakpoint classes
        body.classList.remove('mobile', 'tablet', 'desktop');
        
        // Add new breakpoint class
        body.classList.add(breakpoint);
        
        // Update layout
        this.updateLayoutForBreakpoint(breakpoint);
    }
    
    updateLayoutForBreakpoint(breakpoint) {
        switch (breakpoint) {
            case 'mobile':
                this.enableMobileLayout();
                break;
            case 'tablet':
                this.enableTabletLayout();
                break;
            case 'desktop':
                this.enableDesktopLayout();
                break;
        }
    }
    
    enableMobileLayout() {
        // Enable mobile-specific features
        this.enableMobileNavigation();
        this.enableMobileCharts();
        this.enableMobileForms();
    }
    
    enableTabletLayout() {
        // Enable tablet-specific features
        this.enableTabletNavigation();
        this.enableTabletCharts();
        this.enableTabletForms();
    }
    
    enableDesktopLayout() {
        // Enable desktop-specific features
        this.enableDesktopNavigation();
        this.enableDesktopCharts();
        this.enableDesktopForms();
    }
}

class PerformanceOptimizer {
    constructor() {
        this.lazyLoader = new LazyLoader();
        this.imageOptimizer = new ImageOptimizer();
        this.codeSplitter = new CodeSplitter();
    }
    
    async initialize() {
        // Setup lazy loading
        await this.lazyLoader.initialize();
        
        // Setup image optimization
        await this.imageOptimizer.initialize();
        
        // Setup code splitting
        await this.codeSplitter.initialize();
    }
}

class BatteryOptimizer {
    constructor() {
        this.backgroundTasks = new Map();
        this.performanceMode = 'balanced';
    }
    
    async initialize() {
        // Setup battery monitoring
        this.setupBatteryMonitoring();
        
        // Setup performance modes
        this.setupPerformanceModes();
        
        // Setup background task management
        this.setupBackgroundTaskManagement();
    }
    
    setupBatteryMonitoring() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                this.monitorBatteryLevel(battery);
            });
        }
    }
    
    monitorBatteryLevel(battery) {
        battery.addEventListener('levelchange', () => {
            this.handleBatteryLevelChange(battery.level);
        });
        
        battery.addEventListener('chargingchange', () => {
            this.handleChargingChange(battery.charging);
        });
    }
    
    handleBatteryLevelChange(level) {
        if (level < 0.2) {
            this.enablePowerSavingMode();
        } else if (level > 0.5) {
            this.disablePowerSavingMode();
        }
    }
    
    handleChargingChange(charging) {
        if (charging) {
            this.enableHighPerformanceMode();
        } else {
            this.enableBalancedMode();
        }
    }
    
    enablePowerSavingMode() {
        this.performanceMode = 'power-saving';
        
        // Reduce update frequency
        this.reduceUpdateFrequency();
        
        // Disable non-essential features
        this.disableNonEssentialFeatures();
        
        // Optimize animations
        this.optimizeAnimations();
    }
    
    enableHighPerformanceMode() {
        this.performanceMode = 'high-performance';
        
        // Increase update frequency
        this.increaseUpdateFrequency();
        
        // Enable all features
        this.enableAllFeatures();
        
        // Optimize for performance
        this.optimizeForPerformance();
    }
}
```

## Notification System - Vollständige Implementierung

### 1. Real-time Notifications - Detaillierte Implementierung
```javascript
class AdvancedNotificationService {
    constructor() {
        this.notificationTypes = {
            'price_alert': new PriceAlertNotification(),
            'signal_alert': new SignalAlertNotification(),
            'risk_alert': new RiskAlertNotification(),
            'news_alert': new NewsAlertNotification(),
            'system_alert': new SystemAlertNotification()
        };
        
        this.notificationChannels = {
            'push': new PushNotificationChannel(),
            'email': new EmailNotificationChannel(),
            'sms': new SMSNotificationChannel(),
            'webhook': new WebhookNotificationChannel()
        };
        
        this.notificationPreferences = new NotificationPreferences();
        this.notificationHistory = new NotificationHistory();
    }
    
    async initialize() {
        // Initialize notification channels
        await this.initializeNotificationChannels();
        
        // Setup notification preferences
        await this.setupNotificationPreferences();
        
        // Setup notification history
        await this.setupNotificationHistory();
        
        // Setup notification scheduling
        await this.setupNotificationScheduling();
    }
    
    async sendNotification(type, data, channels = ['push']) {
        try {
            // Get notification template
            const template = this.getNotificationTemplate(type);
            
            // Generate notification content
            const content = this.generateNotificationContent(template, data);
            
            // Send to specified channels
            for (const channel of channels) {
                await this.sendToChannel(channel, content);
            }
            
            // Log notification
            await this.logNotification(type, data, channels);
            
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
    
    async sendPriceAlert(symbol, price, change, threshold) {
        const data = {
            symbol: symbol,
            price: price,
            change: change,
            threshold: threshold,
            timestamp: new Date().toISOString()
        };
        
        await this.sendNotification('price_alert', data, ['push', 'email']);
    }
    
    async sendSignalAlert(signal) {
        const data = {
            symbol: signal.symbol,
            action: signal.action,
            confidence: signal.confidence,
            reasoning: signal.reasoning,
            timestamp: new Date().toISOString()
        };
        
        await this.sendNotification('signal_alert', data, ['push', 'email']);
    }
    
    async sendRiskAlert(riskData) {
        const data = {
            risk_level: riskData.level,
            risk_type: riskData.type,
            portfolio_value: riskData.portfolioValue,
            risk_amount: riskData.riskAmount,
            timestamp: new Date().toISOString()
        };
        
        await this.sendNotification('risk_alert', data, ['push', 'email', 'sms']);
    }
    
    async sendNewsAlert(news) {
        const data = {
            title: news.title,
            source: news.source,
            impact: news.impact,
            symbols: news.symbols,
            timestamp: new Date().toISOString()
        };
        
        await this.sendNotification('news_alert', data, ['push', 'email']);
    }
    
    async sendSystemAlert(alert) {
        const data = {
            type: alert.type,
            message: alert.message,
            severity: alert.severity,
            timestamp: new Date().toISOString()
        };
        
        await this.sendNotification('system_alert', data, ['push', 'email', 'webhook']);
    }
    
    getNotificationTemplate(type) {
        const templates = {
            'price_alert': {
                title: '{symbol} Price Alert',
                body: '{symbol} is now ${price} ({change}%)',
                icon: '/icons/price-alert.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view', title: 'View Details' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            },
            'signal_alert': {
                title: 'New Trading Signal',
                body: '{symbol}: {action} - {confidence}% confidence',
                icon: '/icons/signal-alert.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view', title: 'View Signal' },
                    { action: 'trade', title: 'Execute Trade' }
                ]
            },
            'risk_alert': {
                title: 'Risk Alert',
                body: 'Portfolio risk level: {risk_level}',
                icon: '/icons/risk-alert.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view', title: 'View Risk' },
                    { action: 'adjust', title: 'Adjust Portfolio' }
                ]
            },
            'news_alert': {
                title: 'Market News',
                body: '{title}',
                icon: '/icons/news-alert.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view', title: 'Read Article' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            },
            'system_alert': {
                title: 'System Alert',
                body: '{message}',
                icon: '/icons/system-alert.png',
                badge: '/icons/badge.png',
                actions: [
                    { action: 'view', title: 'View Details' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            }
        };
        
        return templates[type];
    }
    
    generateNotificationContent(template, data) {
        let content = { ...template };
        
        // Replace placeholders with actual data
        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{${key}}`;
            content.title = content.title.replace(placeholder, value);
            content.body = content.body.replace(placeholder, value);
        }
        
        return content;
    }
    
    async sendToChannel(channel, content) {
        const channelHandler = this.notificationChannels[channel];
        if (channelHandler) {
            await channelHandler.send(content);
        }
    }
    
    async logNotification(type, data, channels) {
        await this.notificationHistory.add({
            type: type,
            data: data,
            channels: channels,
            timestamp: new Date().toISOString()
        });
    }
}
```

### 2. Notification Channels - Vollständige Implementierung
```javascript
class PushNotificationChannel {
    constructor() {
        this.serviceWorker = null;
        this.subscription = null;
    }
    
    async initialize() {
        // Get service worker registration
        this.serviceWorker = await navigator.serviceWorker.ready;
        
        // Get push subscription
        this.subscription = await this.getPushSubscription();
    }
    
    async getPushSubscription() {
        if (this.serviceWorker && this.serviceWorker.pushManager) {
            return await this.serviceWorker.pushManager.getSubscription();
        }
        return null;
    }
    
    async send(content) {
        if (!this.subscription) {
            throw new Error('No push subscription available');
        }
        
        try {
            const response = await fetch('/api/notifications/send-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: this.subscription,
                    content: content
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send push notification');
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
}

class EmailNotificationChannel {
    constructor() {
        this.emailService = new EmailService();
    }
    
    async initialize() {
        await this.emailService.initialize();
    }
    
    async send(content) {
        try {
            const emailData = {
                to: this.getUserEmail(),
                subject: content.title,
                body: content.body,
                html: this.generateEmailHTML(content)
            };
            
            await this.emailService.sendEmail(emailData);
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    }
    
    generateEmailHTML(content) {
        return `
            <html>
                <head>
                    <style>
                        .notification { font-family: Arial, sans-serif; }
                        .header { background-color: #f0f0f0; padding: 20px; }
                        .content { padding: 20px; }
                        .footer { background-color: #f0f0f0; padding: 10px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="notification">
                        <div class="header">
                            <h2>${content.title}</h2>
                        </div>
                        <div class="content">
                            <p>${content.body}</p>
                        </div>
                        <div class="footer">
                            <p>AI Investment System</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }
}

class SMSNotificationChannel {
    constructor() {
        this.smsService = new SMSService();
    }
    
    async initialize() {
        await this.smsService.initialize();
    }
    
    async send(content) {
        try {
            const smsData = {
                to: this.getUserPhoneNumber(),
                message: `${content.title}: ${content.body}`
            };
            
            await this.smsService.sendSMS(smsData);
        } catch (error) {
            console.error('Error sending SMS notification:', error);
        }
    }
}

class WebhookNotificationChannel {
    constructor() {
        this.webhookService = new WebhookService();
    }
    
    async initialize() {
        await this.webhookService.initialize();
    }
    
    async send(content) {
        try {
            const webhookData = {
                url: this.getWebhookURL(),
                data: {
                    type: 'notification',
                    content: content,
                    timestamp: new Date().toISOString()
                }
            };
            
            await this.webhookService.sendWebhook(webhookData);
        } catch (error) {
            console.error('Error sending webhook notification:', error);
        }
    }
}
```

### 3. Mobile UI Components - Vollständige Implementierung
```javascript
class MobileUIComponents {
    constructor() {
        this.swipeCards = new SwipeCards();
        this.pullToRefresh = new PullToRefresh();
        this.infiniteScroll = new InfiniteScroll();
        this.touchFeedback = new TouchFeedback();
    }
    
    async initialize() {
        // Initialize swipe cards
        await this.swipeCards.initialize();
        
        // Initialize pull to refresh
        await this.pullToRefresh.initialize();
        
        // Initialize infinite scroll
        await this.infiniteScroll.initialize();
        
        // Initialize touch feedback
        await this.touchFeedback.initialize();
    }
}

class SwipeCards {
    constructor() {
        this.cards = [];
        this.currentIndex = 0;
        this.swipeThreshold = 100;
    }
    
    async initialize() {
        // Setup swipe card container
        this.setupSwipeCardContainer();
        
        // Setup swipe event listeners
        this.setupSwipeEventListeners();
        
        // Setup card animations
        this.setupCardAnimations();
    }
    
    setupSwipeCardContainer() {
        const container = document.createElement('div');
        container.className = 'swipe-cards-container';
        container.innerHTML = `
            <div class="swipe-cards-wrapper">
                <div class="swipe-cards-track"></div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    setupSwipeEventListeners() {
        const container = document.querySelector('.swipe-cards-container');
        
        container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        });
        
        container.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        });
        
        container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });
    }
    
    handleTouchStart(e) {
        this.touchStart = e.touches[0];
        this.startX = this.touchStart.clientX;
        this.startY = this.touchStart.clientY;
    }
    
    handleTouchMove(e) {
        if (!this.touchStart) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;
        
        // Update card position
        this.updateCardPosition(deltaX, deltaY);
        
        // Update card rotation
        this.updateCardRotation(deltaX);
    }
    
    handleTouchEnd(e) {
        if (!this.touchStart) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.startX;
        
        // Determine swipe direction
        if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                this.swipeRight();
            } else {
                this.swipeLeft();
            }
        } else {
            this.snapBack();
        }
        
        this.touchStart = null;
    }
    
    swipeRight() {
        // Like or accept action
        this.performCardAction('like');
        this.nextCard();
    }
    
    swipeLeft() {
        // Dislike or reject action
        this.performCardAction('dislike');
        this.nextCard();
    }
    
    snapBack() {
        // Return card to original position
        this.animateCardToPosition(0, 0, 0);
    }
    
    nextCard() {
        this.currentIndex++;
        this.showNextCard();
    }
    
    showNextCard() {
        const cards = document.querySelectorAll('.swipe-card');
        if (this.currentIndex < cards.length) {
            cards[this.currentIndex].classList.add('active');
        }
    }
}

class PullToRefresh {
    constructor() {
        this.refreshThreshold = 100;
        this.isRefreshing = false;
    }
    
    async initialize() {
        // Setup pull to refresh container
        this.setupPullToRefreshContainer();
        
        // Setup pull event listeners
        this.setupPullEventListeners();
    }
    
    setupPullToRefreshContainer() {
        const container = document.createElement('div');
        container.className = 'pull-to-refresh-container';
        container.innerHTML = `
            <div class="pull-to-refresh-indicator">
                <div class="refresh-icon">↻</div>
                <div class="refresh-text">Pull to refresh</div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    setupPullEventListeners() {
        const container = document.querySelector('.pull-to-refresh-container');
        
        container.addEventListener('touchstart', (e) => {
            this.handlePullStart(e);
        });
        
        container.addEventListener('touchmove', (e) => {
            this.handlePullMove(e);
        });
        
        container.addEventListener('touchend', (e) => {
            this.handlePullEnd(e);
        });
    }
    
    handlePullStart(e) {
        this.pullStart = e.touches[0];
        this.startY = this.pullStart.clientY;
    }
    
    handlePullMove(e) {
        if (!this.pullStart) return;
        
        const touch = e.touches[0];
        const deltaY = touch.clientY - this.startY;
        
        if (deltaY > 0 && window.scrollY === 0) {
            // Update pull indicator
            this.updatePullIndicator(deltaY);
            
            // Prevent default scrolling
            e.preventDefault();
        }
    }
    
    handlePullEnd(e) {
        if (!this.pullStart) return;
        
        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - this.startY;
        
        if (deltaY > this.refreshThreshold) {
            this.triggerRefresh();
        } else {
            this.resetPullIndicator();
        }
        
        this.pullStart = null;
    }
    
    updatePullIndicator(deltaY) {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        const progress = Math.min(deltaY / this.refreshThreshold, 1);
        
        indicator.style.transform = `translateY(${deltaY}px)`;
        indicator.style.opacity = progress;
        
        if (progress >= 1) {
            indicator.querySelector('.refresh-text').textContent = 'Release to refresh';
        }
    }
    
    async triggerRefresh() {
        this.isRefreshing = true;
        
        // Show refresh indicator
        this.showRefreshIndicator();
        
        try {
            // Perform refresh
            await this.performRefresh();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            this.isRefreshing = false;
            this.resetPullIndicator();
        }
    }
    
    async performRefresh() {
        // Refresh data from server
        await this.refreshData();
        
        // Update UI
        await this.updateUI();
    }
    
    resetPullIndicator() {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        indicator.style.transform = 'translateY(-100px)';
        indicator.style.opacity = '0';
        indicator.querySelector('.refresh-text').textContent = 'Pull to refresh';
    }
}

class InfiniteScroll {
    constructor() {
        this.loadingThreshold = 100;
        this.isLoading = false;
        this.hasMoreData = true;
    }
    
    async initialize() {
        // Setup infinite scroll container
        this.setupInfiniteScrollContainer();
        
        // Setup scroll event listeners
        this.setupScrollEventListeners();
    }
    
    setupInfiniteScrollContainer() {
        const container = document.createElement('div');
        container.className = 'infinite-scroll-container';
        container.innerHTML = `
            <div class="infinite-scroll-content"></div>
            <div class="infinite-scroll-loading" style="display: none;">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading more...</div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    setupScrollEventListeners() {
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }
    
    handleScroll() {
        if (this.isLoading || !this.hasMoreData) return;
        
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - this.loadingThreshold) {
            this.loadMoreData();
        }
    }
    
    async loadMoreData() {
        this.isLoading = true;
        
        // Show loading indicator
        this.showLoadingIndicator();
        
        try {
            // Load more data
            const newData = await this.fetchMoreData();
            
            // Append new data
            this.appendData(newData);
            
            // Check if there's more data
            this.hasMoreData = newData.length > 0;
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }
    
    showLoadingIndicator() {
        const loading = document.querySelector('.infinite-scroll-loading');
        loading.style.display = 'block';
    }
    
    hideLoadingIndicator() {
        const loading = document.querySelector('.infinite-scroll-loading');
        loading.style.display = 'none';
    }
    
    async fetchMoreData() {
        // Fetch more data from server
        const response = await fetch('/api/data/load-more');
        return await response.json();
    }
    
    appendData(data) {
        const content = document.querySelector('.infinite-scroll-content');
        
        for (const item of data) {
            const element = this.createDataElement(item);
            content.appendChild(element);
        }
    }
    
    createDataElement(item) {
        const element = document.createElement('div');
        element.className = 'data-item';
        element.textContent = item.text;
        return element;
    }
}

class TouchFeedback {
    constructor() {
        this.feedbackTypes = {
            'light': 'light',
            'medium': 'medium',
            'heavy': 'heavy',
            'success': 'success',
            'error': 'error',
            'warning': 'warning'
        };
    }
    
    async initialize() {
        // Check if haptic feedback is supported
        if ('vibrate' in navigator) {
            this.setupHapticFeedback();
        }
        
        // Setup visual feedback
        this.setupVisualFeedback();
    }
    
    setupHapticFeedback() {
        // Setup haptic feedback for different actions
        this.setupActionHaptics();
    }
    
    setupActionHaptics() {
        // Button press feedback
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .clickable')) {
                this.triggerHapticFeedback('light');
            }
        });
        
        // Swipe feedback
        document.addEventListener('swipe', (e) => {
            this.triggerHapticFeedback('medium');
        });
        
        // Success feedback
        document.addEventListener('success', (e) => {
            this.triggerHapticFeedback('success');
        });
        
        // Error feedback
        document.addEventListener('error', (e) => {
            this.triggerHapticFeedback('error');
        });
    }
    
    triggerHapticFeedback(type) {
        const patterns = {
            'light': [10],
            'medium': [20],
            'heavy': [50],
            'success': [10, 10, 10],
            'error': [100],
            'warning': [50, 50]
        };
        
        const pattern = patterns[type];
        if (pattern) {
            navigator.vibrate(pattern);
        }
    }
    
    setupVisualFeedback() {
        // Setup visual feedback for touch interactions
        this.setupTouchVisualFeedback();
    }
    
    setupTouchVisualFeedback() {
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('button, .clickable')) {
                e.target.classList.add('touch-active');
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .clickable')) {
                e.target.classList.remove('touch-active');
            }
        });
    }
}
```

## Integration mit bestehendem System

### API Endpoints
```javascript
// Notification API
app.post('/api/notifications/send', async (req, res) => {
    try {
        const { type, data, channels } = req.body;
        
        const notificationService = new AdvancedNotificationService();
        await notificationService.sendNotification(type, data, channels);
        
        res.json({
            success: true,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Push Notification Subscription
app.post('/api/notifications/subscribe', async (req, res) => {
    try {
        const { subscription } = req.body;
        
        // Store subscription in database
        await this.storePushSubscription(subscription);
        
        res.json({
            success: true,
            message: 'Subscription stored successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### Database Schema
```sql
-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    channels TEXT[] NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    clicked_at TIMESTAMP
);

-- Push Subscriptions Table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Performance Monitoring
```javascript
class NotificationPerformanceMonitor {
    constructor() {
        this.metrics = {
            'delivery_rates': new Map(),
            'click_rates': new Map(),
            'error_rates': new Map(),
            'response_times': new Map()
        };
    }
    
    trackNotificationDelivery(type, channel, success, error = null) {
        const key = `${type}_${channel}`;
        
        // Track delivery rates
        if (!this.metrics.delivery_rates.has(key)) {
            this.metrics.delivery_rates.set(key, { sent: 0, delivered: 0 });
        }
        
        const rates = this.metrics.delivery_rates.get(key);
        rates.sent++;
        if (success) rates.delivered++;
        
        // Track errors
        if (error) {
            if (!this.metrics.error_rates.has(key)) {
                this.metrics.error_rates.set(key, []);
            }
            this.metrics.error_rates.get(key).push({
                error: error.message,
                timestamp: new Date()
            });
        }
    }
    
    trackNotificationClick(type, channel) {
        const key = `${type}_${channel}`;
        
        if (!this.metrics.click_rates.has(key)) {
            this.metrics.click_rates.set(key, { sent: 0, clicked: 0 });
        }
        
        const rates = this.metrics.click_rates.get(key);
        rates.clicked++;
    }
    
    getPerformanceReport() {
        const report = {};
        
        for (const [key, rates] of this.metrics.delivery_rates) {
            const errors = this.metrics.error_rates.get(key) || [];
            const clicks = this.metrics.click_rates.get(key) || { sent: 0, clicked: 0 };
            
            report[key] = {
                delivery_rate: rates.delivered / rates.sent,
                click_rate: clicks.clicked / rates.sent,
                error_count: errors.length,
                last_error: errors.length > 0 ? errors[errors.length - 1] : null
            };
        }
        
        return report;
    }
}
```
