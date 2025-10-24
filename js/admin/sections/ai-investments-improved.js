/**
 * AI Investment System - Improved Version
 * Mit Loading States, Error Handling und besseren UX
 */

class AIInvestmentSectionImproved {
    constructor() {
        this.isLoading = false;
        this.errorCount = 0;
        this.maxRetries = 3;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Loading State Management
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
            loadingElement.querySelector('.loading-message').textContent = message;
        }
    }

    hideLoading() {
        this.isLoading = false;
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Error Handling
    showError(message, error = null) {
        console.error('AI Investment Error:', message, error);
        
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.querySelector('.error-text').textContent = message;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        
        this.errorCount++;
        
        // Show retry button if error count is low
        if (this.errorCount < this.maxRetries) {
            this.showRetryButton();
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.style.display = 'block';
            successElement.querySelector('.success-text').textContent = message;
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    }

    showRetryButton() {
        const retryElement = document.getElementById('retry-button');
        if (retryElement) {
            retryElement.style.display = 'block';
            retryElement.onclick = () => {
                this.retryLastOperation();
                retryElement.style.display = 'none';
            };
        }
    }

    // Caching System
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Improved Data Loading
    async loadDataWithRetry(operation, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                this.showLoading(`Loading data... (Attempt ${i + 1}/${retries})`);
                const result = await operation();
                this.hideLoading();
                this.showSuccess('Data loaded successfully!');
                return result;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                
                if (i === retries - 1) {
                    this.hideLoading();
                    this.showError(`Failed to load data after ${retries} attempts`, error);
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    // Enhanced Signal Loading
    async loadSignals() {
        const cacheKey = 'signals';
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData) {
            console.log('📦 Using cached signals data');
            this.displaySignals(cachedData);
            return cachedData;
        }

        try {
            const signals = await this.loadDataWithRetry(async () => {
                const [redditSignals, newsSignals, twitterSignals] = await Promise.all([
                    this.fetchRedditSignals(),
                    this.fetchNewsSignals(),
                    this.fetchTwitterSignals()
                ]);
                
                return [...redditSignals, ...newsSignals, ...twitterSignals];
            });
            
            this.setCachedData(cacheKey, signals);
            this.displaySignals(signals);
            return signals;
            
        } catch (error) {
            this.showError('Failed to load signals', error);
            return [];
        }
    }

    // Enhanced Proposal Generation
    async generateProposals() {
        try {
            this.showLoading('Generating investment proposals...');
            
            const signals = await this.loadSignals();
            const proposals = await this.analyzeSignalsForProposals(signals);
            
            this.hideLoading();
            this.displayProposals(proposals);
            this.showSuccess(`Generated ${proposals.length} investment proposals`);
            
            return proposals;
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to generate proposals', error);
            return [];
        }
    }

    // Progress Tracking
    updateProgress(step, total, message) {
        const progressElement = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressElement) {
            const percentage = (step / total) * 100;
            progressElement.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }

    // Debounced Search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhanced Search
    setupSearch() {
        const searchInput = document.getElementById('signal-search');
        if (searchInput) {
            const debouncedSearch = this.debounce((query) => {
                this.filterSignals(query);
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    // Signal Filtering
    filterSignals(query) {
        const signals = document.querySelectorAll('.signal-item');
        const queryLower = query.toLowerCase();
        
        signals.forEach(signal => {
            const text = signal.textContent.toLowerCase();
            const matches = text.includes(queryLower);
            signal.style.display = matches ? 'block' : 'none';
        });
    }

    // Performance Monitoring
    startPerformanceMonitoring() {
        this.performanceStart = performance.now();
    }

    endPerformanceMonitoring(operation) {
        const duration = performance.now() - this.performanceStart;
        console.log(`⏱️ ${operation} took ${duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (duration > 1000) {
            console.warn(`🐌 Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
        }
    }

    // Auto-refresh with exponential backoff
    setupAutoRefresh() {
        let refreshInterval = 30000; // 30 seconds
        let maxInterval = 300000; // 5 minutes
        
        const refresh = async () => {
            try {
                await this.loadData();
                // Reset interval on success
                refreshInterval = 30000;
            } catch (error) {
                // Increase interval on error
                refreshInterval = Math.min(refreshInterval * 2, maxInterval);
                console.warn(`Auto-refresh failed, retrying in ${refreshInterval}ms`);
            }
            
            setTimeout(refresh, refreshInterval);
        };
        
        // Start auto-refresh
        setTimeout(refresh, refreshInterval);
    }

    // Initialize with improved error handling
    async initialize() {
        try {
            this.startPerformanceMonitoring();
            
            // Load Chart.js first
            await this.initializeCharts();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup search
            this.setupSearch();
            
            // Load initial data
            await this.loadData();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            this.endPerformanceMonitoring('Initialization');
            this.showSuccess('AI Investment System initialized successfully!');
            
        } catch (error) {
            this.showError('Failed to initialize AI Investment System', error);
        }
    }

    // Chart.js initialization
    async initializeCharts() {
        try {
            // Load Chart.js if not already loaded
            if (typeof Chart === 'undefined') {
                await this.loadChartJS();
            }
            
            // Initialize charts
            this.createPerformanceChart();
            this.createSignalDistributionChart();
            this.createRiskAnalysisChart();
            
        } catch (error) {
            console.error('Chart initialization failed:', error);
            this.showError('Failed to initialize charts', error);
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                resolve(Chart);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js';
            script.onload = () => resolve(Chart);
            script.onerror = () => reject(new Error('Chart.js failed to load'));
            document.head.appendChild(script);
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Portfolio Performance',
                    data: [100, 105, 110, 108, 115, 120],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Performance Over Time'
                    }
                }
            }
        });
    }

    createSignalDistributionChart() {
        const ctx = document.getElementById('signalDistributionChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Reddit', 'Twitter', 'News', 'Other'],
                datasets: [{
                    data: [30, 25, 35, 10],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(201, 203, 207)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Signal Distribution by Source'
                    }
                }
            }
        });
    }

    createRiskAnalysisChart() {
        const ctx = document.getElementById('riskAnalysisChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Volatility', 'Correlation', 'Liquidity', 'Market Risk', 'Credit Risk'],
                datasets: [{
                    label: 'Current Risk Profile',
                    data: [65, 45, 80, 55, 35],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk Analysis Dashboard'
                    }
                }
            }
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const aiInvestmentSection = new AIInvestmentSectionImproved();
    aiInvestmentSection.initialize();
});

// Export for global access
window.AIInvestmentSectionImproved = AIInvestmentSectionImproved;
