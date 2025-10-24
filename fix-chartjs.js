/**
 * Chart.js Fix - Chart is not defined Error
 * Löst das Chart.js Problem im AI Investment System
 */

// Chart.js CDN Link hinzufügen
function loadChartJS() {
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

// Chart.js laden und initialisieren
async function initializeCharts() {
    try {
        await loadChartJS();
        console.log('✅ Chart.js loaded successfully');
        
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            new Chart(performanceCtx, {
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
        
        // Signal Distribution Chart
        const signalCtx = document.getElementById('signalDistributionChart');
        if (signalCtx) {
            new Chart(signalCtx, {
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
        
        // Risk Analysis Chart
        const riskCtx = document.getElementById('riskAnalysisChart');
        if (riskCtx) {
            new Chart(riskCtx, {
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
        
        console.log('✅ All charts initialized successfully');
        
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCharts);
} else {
    initializeCharts();
}

// Export for manual initialization
window.initializeCharts = initializeCharts;
