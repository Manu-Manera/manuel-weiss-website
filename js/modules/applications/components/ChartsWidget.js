// 📈 Charts Widget - Advanced Visualisierungen für Bewerbungsanalytics
// Chart.js Integration mit interaktiven Dashboards und Real-time Updates

export class ChartsWidget {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            enableInteractivity: options.enableInteractivity !== false,
            enableExport: options.enableExport !== false,
            enableRealTime: options.enableRealTime !== false,
            refreshInterval: options.refreshInterval || 60000,
            chartLibrary: options.chartLibrary || 'chartjs', // 'chartjs', 'd3', 'plotly'
            ...options
        };

        this.container = this.options.container;
        this.charts = new Map();
        this.isChartsLoaded = false;
        this.refreshTimer = null;
    }

    async init() {
        try {
            await this.loadChartLibrary();
            await this.render();
            this.setupEventListeners();
            this.startRealTimeUpdates();
            
            console.log('✅ ChartsWidget initialized');
        } catch (error) {
            console.error('❌ ChartsWidget initialization failed:', error);
            this.renderError('Fehler beim Laden der Visualisierungen');
        }
    }

    async loadChartLibrary() {
        if (this.options.chartLibrary === 'chartjs' && !window.Chart) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js';
                script.onload = () => {
                    this.isChartsLoaded = true;
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        this.isChartsLoaded = true;
    }

    async render() {
        this.container.innerHTML = this.getHTML();
        await this.renderAllCharts();
    }

    getHTML() {
        return `
            <div class="charts-widget">
                <div class="charts-header">
                    <h3>📈 Bewerbungsanalytics</h3>
                    <div class="charts-controls">
                        <select id="timeRangeSelector" onchange="chartsWidget.changeTimeRange(this.value)">
                            <option value="week">Letzte Woche</option>
                            <option value="month" selected>Letzter Monat</option>
                            <option value="quarter">Letztes Quartal</option>
                            <option value="year">Letztes Jahr</option>
                            <option value="all">Alle Zeit</option>
                        </select>
                        <button class="btn-icon" onclick="chartsWidget.refresh()" title="Aktualisieren">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="chartsWidget.exportCharts()" title="Exportieren">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <div class="charts-grid">
                    <!-- Status Distribution Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>🎯 Status-Verteilung</h4>
                            <div class="chart-legend" id="statusLegend"></div>
                        </div>
                        <div class="chart-canvas-container">
                            <canvas id="statusChart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- Timeline Chart -->
                    <div class="chart-container wide">
                        <div class="chart-header">
                            <h4>📊 Bewerbungs-Timeline</h4>
                            <div class="chart-metrics">
                                <span class="metric" id="trendMetric">Trend: +0%</span>
                                <span class="metric" id="avgMetric">Ø 0/Monat</span>
                            </div>
                        </div>
                        <div class="chart-canvas-container">
                            <canvas id="timelineChart" width="800" height="300"></canvas>
                        </div>
                    </div>

                    <!-- Success Rate Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>📈 Erfolgsrate</h4>
                            <div class="success-metrics">
                                <span class="success-rate" id="currentSuccessRate">0%</span>
                                <span class="success-trend" id="successTrend">📈 +0%</span>
                            </div>
                        </div>
                        <div class="chart-canvas-container">
                            <canvas id="successChart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- Response Time Analysis -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>⏱️ Antwortzeiten</h4>
                            <div class="response-metrics">
                                <span class="avg-time" id="avgResponseTime">0 Tage</span>
                                <span class="time-trend" id="timeTrend">📉 -0%</span>
                            </div>
                        </div>
                        <div class="chart-canvas-container">
                            <canvas id="responseChart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- Company Analysis -->
                    <div class="chart-container wide">
                        <div class="chart-header">
                            <h4>🏢 Unternehmen-Analyse</h4>
                            <div class="company-metrics">
                                <span class="total-companies" id="totalCompanies">0 Unternehmen</span>
                                <span class="top-performer" id="topPerformer">Bestes: -</span>
                            </div>
                        </div>
                        <div class="chart-canvas-container">
                            <canvas id="companyChart" width="800" height="300"></canvas>
                        </div>
                    </div>

                    <!-- Performance Insights -->
                    <div class="chart-container insights">
                        <div class="chart-header">
                            <h4>💡 KI-Insights</h4>
                        </div>
                        <div class="insights-content" id="insightsContent">
                            <div class="loading-insights">
                                <i class="fas fa-brain fa-pulse"></i>
                                <span>KI analysiert Ihre Bewerbungsmuster...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderAllCharts() {
        if (!this.isChartsLoaded) {
            console.warn('Chart library not loaded yet');
            return;
        }

        const statistics = this.applicationCore.getStatistics();
        const applications = this.applicationCore.getAllApplications();

        // Render individual charts
        await Promise.all([
            this.renderStatusChart(statistics),
            this.renderTimelineChart(applications),
            this.renderSuccessChart(statistics),
            this.renderResponseChart(applications),
            this.renderCompanyChart(statistics.topCompanies),
            this.renderInsights(applications, statistics)
        ]);
    }

    async renderStatusChart(statistics) {
        const canvas = this.container.querySelector('#statusChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if exists
        if (this.charts.has('status')) {
            this.charts.get('status').destroy();
        }

        const data = {
            labels: ['Ausstehend', 'Interview', 'Zusage', 'Absage', 'Zurückgezogen'],
            datasets: [{
                data: [
                    statistics.pending || 0,
                    statistics.interview || 0,
                    statistics.offer || 0,
                    statistics.rejected || 0,
                    statistics.withdrawn || 0
                ],
                backgroundColor: [
                    '#f59e0b', // Ausstehend - Orange
                    '#3b82f6', // Interview - Blue  
                    '#10b981', // Zusage - Green
                    '#ef4444', // Absage - Red
                    '#6b7280'  // Zurückgezogen - Gray
                ],
                borderWidth: 0,
                borderRadius: 8
            }]
        };

        const config = {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Custom legend
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('status', chart);
        
        // Update custom legend
        this.updateStatusLegend(data);
    }

    async renderTimelineChart(applications) {
        const canvas = this.container.querySelector('#timelineChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('timeline')) {
            this.charts.get('timeline').destroy();
        }

        // Group applications by month
        const monthlyData = this.groupApplicationsByMonth(applications);
        const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
        
        const data = {
            labels: months.map(month => this.formatMonthLabel(month)),
            datasets: [
                {
                    label: 'Bewerbungen',
                    data: months.map(month => monthlyData[month]?.total || 0),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Interviews',
                    data: months.map(month => monthlyData[month]?.interview || 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };

        const config = {
            type: 'line',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('timeline', chart);
        
        // Update metrics
        this.updateTimelineMetrics(monthlyData, months);
    }

    async renderSuccessChart(statistics) {
        const canvas = this.container.querySelector('#successChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('success')) {
            this.charts.get('success').destroy();
        }

        // Create success rate gauge
        const successRate = statistics.successRate || 0;
        const remainingRate = 100 - successRate;

        const data = {
            datasets: [{
                data: [successRate, remainingRate],
                backgroundColor: [
                    this.getSuccessRateColor(successRate),
                    '#e5e7eb'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        };

        const config = {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '75%',
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.font = 'bold 24px Inter';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1f2937';
                    
                    const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
                    const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
                    
                    ctx.fillText(`${successRate}%`, centerX, centerY);
                    ctx.restore();
                }
            }]
        };

        const chart = new Chart(ctx, config);
        this.charts.set('success', chart);
        
        this.updateSuccessMetrics(statistics);
    }

    async renderResponseChart(applications) {
        const canvas = this.container.querySelector('#responseChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('response')) {
            this.charts.get('response').destroy();
        }

        // Analyze response times
        const responseData = this.analyzeResponseTimes(applications);
        
        const data = {
            labels: ['1-3 Tage', '4-7 Tage', '1-2 Wochen', '2-4 Wochen', '1+ Monate', 'Keine Antwort'],
            datasets: [{
                label: 'Bewerbungen',
                data: [
                    responseData.immediate,
                    responseData.quick,
                    responseData.normal,
                    responseData.slow,
                    responseData.verySlow,
                    responseData.noResponse
                ],
                backgroundColor: [
                    '#10b981', // Immediate - Green
                    '#059669', // Quick - Dark Green
                    '#f59e0b', // Normal - Orange
                    '#dc2626', // Slow - Red
                    '#7c2d12', // Very Slow - Dark Red
                    '#6b7280'  // No Response - Gray
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        };

        const config = {
            type: 'bar',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuint'
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('response', chart);
        
        this.updateResponseMetrics(responseData);
    }

    async renderCompanyChart(topCompanies) {
        const canvas = this.container.querySelector('#companyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('company')) {
            this.charts.get('company').destroy();
        }

        if (topCompanies.length === 0) {
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Noch keine Daten verfügbar', canvas.width / 2, canvas.height / 2);
            return;
        }

        const companies = topCompanies.slice(0, 10); // Top 10
        
        const data = {
            labels: companies.map(c => c.company),
            datasets: [{
                label: 'Bewerbungen',
                data: companies.map(c => c.count),
                backgroundColor: companies.map((_, i) => {
                    const hue = (i * 137.5) % 360; // Golden angle for nice color distribution
                    return `hsla(${hue}, 70%, 60%, 0.8)`;
                }),
                borderColor: companies.map((_, i) => {
                    const hue = (i * 137.5) % 360;
                    return `hsla(${hue}, 70%, 50%, 1)`;
                }),
                borderWidth: 2,
                borderRadius: 6
            }]
        };

        const config = {
            type: 'bar',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                animation: {
                    duration: 1800,
                    easing: 'easeOutElastic'
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('company', chart);
        
        this.updateCompanyMetrics(companies);
    }

    async renderInsights(applications, statistics) {
        const insightsContainer = this.container.querySelector('#insightsContent');
        if (!insightsContainer) return;

        // Generate AI-powered insights
        const insights = await this.generateAIInsights(applications, statistics);
        
        insightsContainer.innerHTML = `
            <div class="insights-list">
                ${insights.map(insight => `
                    <div class="insight-item ${insight.type}">
                        <div class="insight-icon">
                            <i class="fas ${insight.icon}"></i>
                        </div>
                        <div class="insight-content">
                            <div class="insight-title">${insight.title}</div>
                            <div class="insight-description">${insight.description}</div>
                            ${insight.action ? `
                                <button class="insight-action" onclick="chartsWidget.executeInsight('${insight.id}')">
                                    ${insight.action}
                                </button>
                            ` : ''}
                        </div>
                        ${insight.confidence ? `
                            <div class="insight-confidence">
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${insight.confidence}%"></div>
                                </div>
                                <span class="confidence-text">${insight.confidence}% sicher</span>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async generateAIInsights(applications, statistics) {
        const insights = [];
        
        // Pattern Analysis
        if (applications.length >= 5) {
            const patterns = this.analyzeApplicationPatterns(applications);
            
            if (patterns.bestDayOfWeek) {
                insights.push({
                    id: 'best-day-pattern',
                    type: 'success',
                    icon: 'fa-calendar-check',
                    title: `${patterns.bestDayOfWeek} ist Ihr bester Bewerbungstag`,
                    description: `${patterns.bestDaySuccessRate}% Erfolgsrate an diesem Tag`,
                    confidence: 85,
                    action: 'Mehr Bewerbungen planen'
                });
            }
            
            if (patterns.optimalTimeWindow) {
                insights.push({
                    id: 'optimal-timing',
                    type: 'info',
                    icon: 'fa-clock',
                    title: `Beste Zeit: ${patterns.optimalTimeWindow}`,
                    description: 'Höchste Antwortrate in diesem Zeitfenster',
                    confidence: 78
                });
            }
        }

        // Success Rate Analysis
        if (statistics.successRate > 0) {
            if (statistics.successRate >= 40) {
                insights.push({
                    id: 'high-success',
                    type: 'success',
                    icon: 'fa-trophy',
                    title: 'Überdurchschnittlich erfolgreich!',
                    description: `${statistics.successRate}% Erfolgsrate (Durchschnitt: 25%)`,
                    confidence: 95,
                    action: 'Strategie dokumentieren'
                });
            } else if (statistics.successRate < 15) {
                insights.push({
                    id: 'low-success',
                    type: 'warning',
                    icon: 'fa-exclamation-triangle',
                    title: 'Erfolgsrate optimierbar',
                    description: 'Bewerbungsqualität könnte verbessert werden',
                    confidence: 88,
                    action: 'Strategie überdenken'
                });
            }
        }

        // Volume Analysis
        const recentApplications = applications.filter(app => {
            const daysDiff = (new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        if (recentApplications.length >= 10) {
            insights.push({
                id: 'high-volume',
                type: 'info',
                icon: 'fa-fire',
                title: 'Hohe Bewerbungsfrequenz',
                description: `${recentApplications.length} Bewerbungen in den letzten 30 Tagen`,
                confidence: 92,
                action: 'Qualität vor Quantität'
            });
        } else if (recentApplications.length <= 2 && applications.length > 5) {
            insights.push({
                id: 'low-volume',
                type: 'warning',
                icon: 'fa-tachometer-alt',
                title: 'Bewerbungsfrequenz niedrig',
                description: 'Mehr Bewerbungen könnten Erfolg steigern',
                confidence: 75,
                action: 'Bewerbungsziele setzen'
            });
        }

        return insights;
    }

    // 📊 Data Analysis Methods
    groupApplicationsByMonth(applications) {
        const monthlyData = {};
        
        applications.forEach(app => {
            const month = new Date(app.createdAt).toISOString().slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { total: 0, interview: 0, offer: 0, rejected: 0 };
            }
            monthlyData[month].total++;
            if (app.status === 'interview') monthlyData[month].interview++;
            if (app.status === 'offer') monthlyData[month].offer++;
            if (app.status === 'rejected') monthlyData[month].rejected++;
        });
        
        return monthlyData;
    }

    analyzeResponseTimes(applications) {
        const responseApps = applications.filter(app => app.responseDate);
        
        const responseTimes = responseApps.map(app => {
            const applied = new Date(app.createdAt);
            const responded = new Date(app.responseDate);
            return Math.ceil((responded - applied) / (1000 * 60 * 60 * 24));
        });

        return {
            immediate: responseTimes.filter(t => t <= 3).length,
            quick: responseTimes.filter(t => t > 3 && t <= 7).length,
            normal: responseTimes.filter(t => t > 7 && t <= 14).length,
            slow: responseTimes.filter(t => t > 14 && t <= 28).length,
            verySlow: responseTimes.filter(t => t > 28).length,
            noResponse: applications.filter(app => !app.responseDate && app.status === 'pending').length
        };
    }

    analyzeApplicationPatterns(applications) {
        // Analyze day of week patterns
        const dayPatterns = {};
        const dayLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        
        applications.forEach(app => {
            const dayOfWeek = new Date(app.createdAt).getDay();
            const dayName = dayLabels[dayOfWeek];
            
            if (!dayPatterns[dayName]) {
                dayPatterns[dayName] = { total: 0, success: 0 };
            }
            dayPatterns[dayName].total++;
            
            if (['interview', 'offer'].includes(app.status)) {
                dayPatterns[dayName].success++;
            }
        });

        // Find best day
        let bestDay = null;
        let bestSuccessRate = 0;
        
        Object.entries(dayPatterns).forEach(([day, data]) => {
            const successRate = data.total > 0 ? (data.success / data.total) * 100 : 0;
            if (successRate > bestSuccessRate) {
                bestSuccessRate = successRate;
                bestDay = day;
            }
        });

        return {
            bestDayOfWeek: bestDay,
            bestDaySuccessRate: Math.round(bestSuccessRate),
            optimalTimeWindow: this.findOptimalTimeWindow(applications)
        };
    }

    findOptimalTimeWindow(applications) {
        // Simple heuristic based on successful applications
        const successful = applications.filter(app => ['interview', 'offer'].includes(app.status));
        const hours = successful.map(app => new Date(app.createdAt).getHours());
        
        if (hours.length === 0) return null;
        
        const avgHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
        
        if (avgHour >= 9 && avgHour <= 11) return '9-11 Uhr';
        if (avgHour >= 14 && avgHour <= 16) return '14-16 Uhr';
        return `${Math.round(avgHour)}:00 Uhr`;
    }

    // 🎨 UI Updates
    updateStatusLegend(data) {
        const legend = this.container.querySelector('#statusLegend');
        if (!legend) return;

        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        legend.innerHTML = data.labels.map((label, i) => {
            const value = data.datasets[0].data[i];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[i]}"></div>
                    <span class="legend-label">${label}</span>
                    <span class="legend-value">${value} (${percentage}%)</span>
                </div>
            `;
        }).join('');
    }

    updateTimelineMetrics(monthlyData, months) {
        if (months.length < 2) return;
        
        const latest = monthlyData[months[months.length - 1]]?.total || 0;
        const previous = monthlyData[months[months.length - 2]]?.total || 0;
        
        const trend = previous > 0 ? ((latest - previous) / previous * 100).toFixed(1) : 0;
        const avg = Object.values(monthlyData).reduce((sum, data) => sum + (data.total || 0), 0) / months.length;
        
        const trendElement = this.container.querySelector('#trendMetric');
        const avgElement = this.container.querySelector('#avgMetric');
        
        if (trendElement) {
            const trendIcon = trend >= 0 ? '📈' : '📉';
            trendElement.textContent = `Trend: ${trendIcon} ${trend}%`;
            trendElement.className = `metric ${trend >= 0 ? 'positive' : 'negative'}`;
        }
        
        if (avgElement) {
            avgElement.textContent = `Ø ${Math.round(avg)}/Monat`;
        }
    }

    updateSuccessMetrics(statistics) {
        const currentRate = this.container.querySelector('#currentSuccessRate');
        const successTrend = this.container.querySelector('#successTrend');
        
        if (currentRate) {
            currentRate.textContent = `${statistics.successRate}%`;
            currentRate.className = `success-rate ${this.getSuccessRateClass(statistics.successRate)}`;
        }
        
        // This would compare to previous period for trend
        // For now, show static trend
        if (successTrend) {
            successTrend.textContent = '📈 Stabil';
        }
    }

    updateResponseMetrics(responseData) {
        const avgTime = this.container.querySelector('#avgResponseTime');
        const timeTrend = this.container.querySelector('#timeTrend');
        
        const totalResponses = Object.values(responseData).reduce((sum, count) => sum + count, 0) - responseData.noResponse;
        const weightedAvg = this.calculateWeightedAverageResponseTime(responseData);
        
        if (avgTime) {
            avgTime.textContent = `${weightedAvg} Tage`;
        }
        
        if (timeTrend) {
            timeTrend.textContent = weightedAvg <= 7 ? '📈 Schnell' : weightedAvg <= 14 ? '📊 Normal' : '📉 Langsam';
            timeTrend.className = `time-trend ${weightedAvg <= 7 ? 'fast' : weightedAvg <= 14 ? 'normal' : 'slow'}`;
        }
    }

    updateCompanyMetrics(companies) {
        const totalCompanies = this.container.querySelector('#totalCompanies');
        const topPerformer = this.container.querySelector('#topPerformer');
        
        if (totalCompanies) {
            totalCompanies.textContent = `${companies.length} Unternehmen`;
        }
        
        if (topPerformer && companies.length > 0) {
            topPerformer.textContent = `Meiste: ${companies[0].company} (${companies[0].count})`;
        }
    }

    // 🛠️ Utility Methods
    formatMonthLabel(month) {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(-2)}`;
    }

    getSuccessRateColor(rate) {
        if (rate >= 40) return '#10b981'; // Green
        if (rate >= 25) return '#f59e0b'; // Orange
        if (rate >= 10) return '#dc2626'; // Red
        return '#6b7280'; // Gray
    }

    getSuccessRateClass(rate) {
        if (rate >= 40) return 'excellent';
        if (rate >= 25) return 'good';
        if (rate >= 10) return 'average';
        return 'needs-improvement';
    }

    calculateWeightedAverageResponseTime(responseData) {
        const weights = {
            immediate: 2,   // 1-3 days
            quick: 5.5,     // 4-7 days  
            normal: 10.5,   // 1-2 weeks
            slow: 21,       // 2-4 weeks
            verySlow: 45    // 1+ months
        };

        let totalWeighted = 0;
        let totalCount = 0;

        Object.entries(responseData).forEach(([key, count]) => {
            if (weights[key] && count > 0) {
                totalWeighted += weights[key] * count;
                totalCount += count;
            }
        });

        return totalCount > 0 ? Math.round(totalWeighted / totalCount) : 0;
    }

    setupEventListeners() {
        // Chart interactions
        this.container.addEventListener('click', (e) => {
            const chartCanvas = e.target.closest('canvas');
            if (chartCanvas && this.options.enableInteractivity) {
                this.handleChartClick(e, chartCanvas);
            }
        });
    }

    handleChartClick(event, canvas) {
        const chart = this.getChartByCanvas(canvas);
        if (!chart) return;

        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        
        if (points.length > 0) {
            const point = points[0];
            const datasetIndex = point.datasetIndex;
            const index = point.index;
            
            // Handle different chart types
            this.handleChartPointClick(canvas.id, datasetIndex, index);
        }
    }

    getChartByCanvas(canvas) {
        const chartId = canvas.id.replace('Chart', '');
        return this.charts.get(chartId);
    }

    handleChartPointClick(canvasId, datasetIndex, index) {
        // Implementation depends on chart type and business logic
        console.log(`Chart clicked: ${canvasId}, dataset: ${datasetIndex}, index: ${index}`);
    }

    changeTimeRange(range) {
        // This would filter data based on selected time range
        console.log(`Time range changed to: ${range}`);
        this.refresh();
    }

    async exportCharts() {
        const charts = Array.from(this.charts.entries());
        const exports = [];
        
        for (const [name, chart] of charts) {
            const url = chart.toBase64Image('image/png', 1);
            exports.push({
                name: `${name}_chart.png`,
                data: url
            });
        }
        
        // Create download links for each chart
        exports.forEach(exp => {
            const a = document.createElement('a');
            a.href = exp.data;
            a.download = exp.name;
            a.click();
        });
    }

    executeInsight(insightId) {
        console.log(`Executing insight: ${insightId}`);
        // Implementation depends on specific insight
    }

    startRealTimeUpdates() {
        if (this.options.enableRealTime) {
            this.refreshTimer = setInterval(() => {
                this.refresh();
            }, this.options.refreshInterval);
        }
    }

    stopRealTimeUpdates() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async refresh() {
        try {
            await this.renderAllCharts();
        } catch (error) {
            console.error('Charts refresh failed:', error);
        }
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="charts-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="chartsWidget.refresh()">Erneut versuchen</button>
            </div>
        `;
    }

    handleResize() {
        // Resize all charts
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    destroy() {
        this.stopRealTimeUpdates();
        
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
        
        this.container.innerHTML = '';
    }
}

// Global reference
window.chartsWidget = null;
export function setGlobalChartsWidget(instance) {
    window.chartsWidget = instance;
}
