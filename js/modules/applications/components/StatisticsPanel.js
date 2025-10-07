// 📊 Statistics Panel Component - Real-time Bewerbungsstatistiken
// Interaktive Karten mit Trend-Analysen und Drill-Down-Funktionen

export class StatisticsPanel {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            showTrends: options.showTrends !== false,
            enableDrillDown: options.enableDrillDown !== false,
            refreshInterval: options.refreshInterval || 60000, // 1 minute
            ...options
        };

        this.container = this.options.container;
        this.statistics = null;
        this.previousStats = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.render();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ StatisticsPanel initialized');
        } catch (error) {
            console.error('❌ StatisticsPanel initialization failed:', error);
            throw error;
        }
    }

    async render() {
        this.statistics = this.applicationCore.getStatistics();
        this.container.innerHTML = this.getHTML();
        
        if (this.options.showTrends) {
            this.renderTrends();
        }
        
        this.animateCounters();
    }

    getHTML() {
        const stats = this.statistics;
        
        return `
            <div class="statistics-panel">
                <div class="panel-header">
                    <h3>📊 Bewerbungsstatistiken</h3>
                    <div class="panel-actions">
                        <button class="btn-icon" onclick="statisticsPanel.refresh()" title="Aktualisieren">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="statisticsPanel.export()" title="Exportieren">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <div class="stats-grid">
                    <!-- Total Applications -->
                    <div class="stat-card primary" data-stat="total">
                        <div class="stat-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.total}">${stats.total}</div>
                            <div class="stat-label">Gesamt</div>
                            ${this.getTrendHTML('total')}
                        </div>
                    </div>

                    <!-- Pending Applications -->
                    <div class="stat-card warning" data-stat="pending">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.pending}">${stats.pending}</div>
                            <div class="stat-label">Ausstehend</div>
                            ${this.getTrendHTML('pending')}
                        </div>
                    </div>

                    <!-- Interviews -->
                    <div class="stat-card info" data-stat="interview">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.interview}">${stats.interview}</div>
                            <div class="stat-label">Interviews</div>
                            ${this.getTrendHTML('interview')}
                        </div>
                    </div>

                    <!-- Offers -->
                    <div class="stat-card success" data-stat="offer">
                        <div class="stat-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.offer}">${stats.offer}</div>
                            <div class="stat-label">Zusagen</div>
                            ${this.getTrendHTML('offer')}
                        </div>
                    </div>

                    <!-- Rejections -->
                    <div class="stat-card danger" data-stat="rejected">
                        <div class="stat-icon">
                            <i class="fas fa-times"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.rejected}">${stats.rejected}</div>
                            <div class="stat-label">Absagen</div>
                            ${this.getTrendHTML('rejected')}
                        </div>
                    </div>

                    <!-- Success Rate -->
                    <div class="stat-card accent" data-stat="successRate">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.successRate}">${stats.successRate}%</div>
                            <div class="stat-label">Erfolgsrate</div>
                            ${this.getTrendHTML('successRate')}
                        </div>
                    </div>

                    <!-- Average Response Time -->
                    <div class="stat-card secondary" data-stat="avgResponseTime">
                        <div class="stat-icon">
                            <i class="fas fa-stopwatch"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" data-target="${stats.averageResponseTime}">${stats.averageResponseTime}</div>
                            <div class="stat-label">Ø Antwortzeit (Tage)</div>
                            ${this.getTrendHTML('averageResponseTime')}
                        </div>
                    </div>

                    <!-- Monthly Progress -->
                    <div class="stat-card wide" data-stat="monthly">
                        <div class="stat-content">
                            <div class="stat-header">
                                <h4>📈 Monatlicher Fortschritt</h4>
                            </div>
                            <div class="monthly-chart" id="monthlyChart">
                                ${this.getMonthlyChartHTML()}
                            </div>
                        </div>
                    </div>

                    <!-- Top Companies -->
                    <div class="stat-card wide" data-stat="companies">
                        <div class="stat-content">
                            <div class="stat-header">
                                <h4>🏢 Top Unternehmen</h4>
                            </div>
                            <div class="companies-list">
                                ${this.getTopCompaniesHTML()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed View Modal -->
                <div class="stats-modal" id="statsModal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 id="modalTitle">Detailansicht</h4>
                            <button class="modal-close" onclick="statisticsPanel.closeModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="modalBody">
                            <!-- Detailed content will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTrendHTML(statType) {
        if (!this.options.showTrends || !this.previousStats) return '';
        
        const current = this.statistics[statType];
        const previous = this.previousStats[statType] || 0;
        const change = current - previous;
        const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
        
        if (change === 0) return '';
        
        const isPositive = change > 0;
        const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
        const className = this.getTrendClass(statType, isPositive);
        
        return `
            <div class="stat-trend ${className}">
                <i class="fas ${icon}"></i>
                <span>${Math.abs(percentChange)}%</span>
            </div>
        `;
    }

    getTrendClass(statType, isPositive) {
        // For some stats, positive change is good, for others it might be neutral/bad
        const positiveStats = ['total', 'interview', 'offer', 'successRate'];
        const negativeStats = ['rejected', 'averageResponseTime'];
        
        if (positiveStats.includes(statType)) {
            return isPositive ? 'trend-up' : 'trend-down';
        } else if (negativeStats.includes(statType)) {
            return isPositive ? 'trend-down' : 'trend-up';
        }
        
        return 'trend-neutral';
    }

    getMonthlyChartHTML() {
        const monthlyStats = this.statistics.monthlyStats;
        const months = Object.keys(monthlyStats).sort().slice(-6); // Last 6 months
        
        if (months.length === 0) {
            return '<p class="no-data">Keine monatlichen Daten verfügbar</p>';
        }
        
        return `
            <div class="mini-chart">
                <div class="chart-bars">
                    ${months.map(month => {
                        const data = monthlyStats[month];
                        const maxHeight = Math.max(...months.map(m => monthlyStats[m].total));
                        const height = maxHeight > 0 ? (data.total / maxHeight) * 100 : 0;
                        
                        return `
                            <div class="chart-bar" style="height: ${height}%" 
                                 data-month="${month}" 
                                 data-total="${data.total}"
                                 onclick="statisticsPanel.showMonthDetails('${month}')">
                                <div class="bar-fill"></div>
                                <div class="bar-label">${this.formatMonth(month)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    getTopCompaniesHTML() {
        const companies = this.statistics.topCompanies.slice(0, 5);
        
        if (companies.length === 0) {
            return '<p class="no-data">Keine Unternehmensdaten verfügbar</p>';
        }
        
        return companies.map(company => `
            <div class="company-item" onclick="statisticsPanel.showCompanyDetails('${company.company}')">
                <div class="company-name">${company.company}</div>
                <div class="company-count">
                    <span class="count-number">${company.count}</span>
                    <span class="count-label">Bewerbung${company.count !== 1 ? 'en' : ''}</span>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Stat card hover effects
        this.container.querySelectorAll('.stat-card[data-stat]').forEach(card => {
            if (this.options.enableDrillDown) {
                card.addEventListener('click', (e) => {
                    const statType = card.dataset.stat;
                    this.showDetailedView(statType);
                });
                
                card.style.cursor = 'pointer';
            }
        });

        // Chart bar interactions
        this.container.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, bar);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showDetailedView(statType) {
        const modal = this.container.querySelector('#statsModal');
        const title = this.container.querySelector('#modalTitle');
        const body = this.container.querySelector('#modalBody');
        
        const titles = {
            total: 'Alle Bewerbungen',
            pending: 'Ausstehende Bewerbungen',
            interview: 'Interview-Einladungen',
            offer: 'Stellenangebote',
            rejected: 'Absagen',
            successRate: 'Erfolgsrate Details',
            avgResponseTime: 'Antwortzeiten'
        };
        
        title.textContent = titles[statType] || 'Details';
        body.innerHTML = this.getDetailedViewHTML(statType);
        
        modal.style.display = 'flex';
    }

    getDetailedViewHTML(statType) {
        const applications = this.applicationCore.getAllApplications();
        
        switch (statType) {
            case 'pending':
                return this.renderApplicationsList(
                    applications.filter(app => app.status === 'pending'),
                    'Ausstehende Bewerbungen'
                );
            case 'interview':
                return this.renderApplicationsList(
                    applications.filter(app => app.status === 'interview'),
                    'Interview-Einladungen'
                );
            case 'offer':
                return this.renderApplicationsList(
                    applications.filter(app => app.status === 'offer'),
                    'Stellenangebote'
                );
            case 'rejected':
                return this.renderApplicationsList(
                    applications.filter(app => app.status === 'rejected'),
                    'Absagen'
                );
            default:
                return '<p>Detailansicht für diesen Bereich ist noch nicht verfügbar.</p>';
        }
    }

    renderApplicationsList(applications, title) {
        if (applications.length === 0) {
            return `<p class="no-data">Keine ${title.toLowerCase()} vorhanden.</p>`;
        }
        
        return `
            <div class="applications-list">
                <h5>${title} (${applications.length})</h5>
                <div class="list-items">
                    ${applications.map(app => `
                        <div class="list-item">
                            <div class="item-header">
                                <strong>${app.company}</strong>
                                <span class="item-date">${this.formatDate(app.createdAt)}</span>
                            </div>
                            <div class="item-content">
                                <p>${app.position}</p>
                                ${app.notes ? `<p class="item-notes">${app.notes}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showMonthDetails(month) {
        const data = this.statistics.monthlyStats[month];
        const modal = this.container.querySelector('#statsModal');
        const title = this.container.querySelector('#modalTitle');
        const body = this.container.querySelector('#modalBody');
        
        title.textContent = `Statistiken für ${this.formatMonth(month)}`;
        body.innerHTML = `
            <div class="month-details">
                <div class="detail-stats">
                    <div class="detail-stat">
                        <span class="label">Bewerbungen gesamt:</span>
                        <span class="value">${data.total}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Interview-Einladungen:</span>
                        <span class="value">${data.interview}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Stellenangebote:</span>
                        <span class="value">${data.offer}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Absagen:</span>
                        <span class="value">${data.rejected}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="label">Erfolgsrate:</span>
                        <span class="value">${data.total > 0 ? Math.round(((data.interview + data.offer) / data.total) * 100) : 0}%</span>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    showCompanyDetails(companyName) {
        const applications = this.applicationCore.getApplicationsByCompany(companyName);
        const modal = this.container.querySelector('#statsModal');
        const title = this.container.querySelector('#modalTitle');
        const body = this.container.querySelector('#modalBody');
        
        title.textContent = `Bewerbungen bei ${companyName}`;
        body.innerHTML = this.renderApplicationsList(applications, `Bewerbungen bei ${companyName}`);
        
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = this.container.querySelector('#statsModal');
        modal.style.display = 'none';
    }

    showTooltip(event, element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <strong>${this.formatMonth(element.dataset.month)}</strong><br>
            ${element.dataset.total} Bewerbung${element.dataset.total !== '1' ? 'en' : ''}
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    animateCounters() {
        const counters = this.container.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const isPercentage = counter.textContent.includes('%');
            
            let current = 0;
            const increment = target / 20; // 20 steps
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                counter.textContent = Math.floor(current) + (isPercentage ? '%' : '');
            }, 50);
        });
    }

    renderTrends() {
        // This would analyze historical data to show trends
        // For now, we'll simulate with random data
        this.previousStats = this.loadPreviousStats();
    }

    loadPreviousStats() {
        // Load from localStorage or API
        const stored = localStorage.getItem('previousApplicationStats');
        return stored ? JSON.parse(stored) : null;
    }

    savePreviousStats() {
        localStorage.setItem('previousApplicationStats', JSON.stringify(this.statistics));
    }

    formatMonth(month) {
        const [year, monthNum] = month.split('-');
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('de-DE');
    }

    async refresh() {
        this.previousStats = this.statistics;
        this.savePreviousStats();
        await this.render();
    }

    async export() {
        const data = {
            statistics: this.statistics,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleResize() {
        // Recalculate chart dimensions if needed
        const monthlyChart = this.container.querySelector('#monthlyChart');
        if (monthlyChart) {
            // Trigger re-render of charts
            this.render();
        }
    }

    destroy() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
        }
        this.container.innerHTML = '';
    }
}

// Make it globally available for onclick handlers
window.statisticsPanel = null;
export function setGlobalStatisticsPanel(instance) {
    window.statisticsPanel = instance;
}
