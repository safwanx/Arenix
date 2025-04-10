// crowd-monitoring.js

class CrowdMonitoringManager {
    constructor() {
        this.videos = {
            normal: document.getElementById('normalView'),
            density: document.getElementById('densityView'),
            overlay: document.getElementById('overlayView')
        };

        this.stats = {
            totalCount: 12628,
            incidentCount: 14,
            alertCount: 5,
            avgDensity: 3.5,
            trends: {
                count: 30.80,
                density: -12.5
            }
        };

        this.alerts = [
            {
                id: 1,
                type: 'danger',
                title: 'Critical Density',
                message: 'North Entrance exceeded safe capacity',
                time: '2 minutes ago',
                icon: 'exclamation-circle'
            },
            {
                id: 2,
                type: 'warning',
                title: 'Flow Rate Warning',
                message: 'Unusual pattern detected in Central Plaza',
                time: '5 minutes ago',
                icon: 'exclamation-triangle'
            }
        ];

        this.recommendations = [
            {
                id: 1,
                priority: 'high',
                title: 'High Density Alert - North Entrance',
                message: 'Consider opening additional entry points to reduce congestion',
                icon: 'exclamation-circle'
            },
            {
                id: 2,
                priority: 'medium',
                title: 'Flow Rate Warning - Central Plaza',
                message: 'Monitor crowd movement patterns and prepare for potential redistribution',
                icon: 'exclamation-triangle'
            }
        ];

        this.densityTrendChart = null;
        this.initializeVideos();
        this.initializeCharts();
        this.initializeEventListeners();
        this.startRealTimeUpdates();
        this.updateDashboard();
    }

    initializeVideos() {
        Object.values(this.videos).forEach(video => {
            if (video) {
                video.loop = true;
                video.muted = true;
                video.playsinline = true;
                video.play().catch(error => console.log("Video autoplay failed:", error));
            }
        });
    }

    initializeCharts() {
        const ctx = document.getElementById('densityTrendChart').getContext('2d');
        this.densityTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Now'],
                datasets: [{
                    label: 'Density Trend',
                    data: [2.8, 3.1, 3.5, 3.2, 3.4, 3.5],
                    borderColor: '#B51AF7',
                    tension: 0.4,
                    fill: false
                }]
            },
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
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    initializeEventListeners() {
        // View controls
        document.querySelectorAll('.view-controls button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Refresh recommendations
        document.getElementById('refreshRecommendations')?.addEventListener('click', () => {
            this.updateRecommendations();
        });
    }

    switchView(viewType) {
        // Update button states
        document.querySelectorAll('.view-controls button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewType) {
                btn.classList.add('active');
            }
        });

        // Update video visibility
        Object.entries(this.videos).forEach(([type, video]) => {
            if (type === viewType) {
                video.classList.remove('hidden-view');
                video.classList.add('active-view');
                video.play();
            } else {
                video.classList.add('hidden-view');
                video.classList.remove('active-view');
                video.pause();
            }
        });
    }

    updateDashboard() {
        this.updateStats();
        this.updateAlerts();
        this.updateRecommendations();
    }

    updateStats() {
        // Update main stats
        document.getElementById('totalCount').textContent = this.formatNumber(this.stats.totalCount);
        document.getElementById('incidentCount').textContent = this.stats.incidentCount;
        document.getElementById('alertCount').textContent = this.stats.alertCount;
        document.getElementById('avgDensity').textContent = `${this.stats.avgDensity}/m²`;

        // Update trends
        document.getElementById('countTrend').textContent = `${this.stats.trends.count}%`;
        document.getElementById('densityTrend').textContent = `${Math.abs(this.stats.trends.density)}%`;
    }

    updateAlerts() {
        const alertList = document.getElementById('alertList');
        alertList.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertElement = `
                <div class="alert-item">
                    <div class="alert-icon ${alert.type}">
                        <i class="fas fa-${alert.icon}"></i>
                    </div>
                    <div class="alert-content">
                        <h4>${alert.title}</h4>
                        <p>${alert.message}</p>
                        <small>${alert.time}</small>
                    </div>
                </div>
            `;
            alertList.insertAdjacentHTML('beforeend', alertElement);
        });
    }

    updateRecommendations() {
        const actionList = document.getElementById('actionList');
        actionList.innerHTML = '';

        this.recommendations.forEach(rec => {
            const recElement = `
                <div class="action-item ${rec.priority}-priority">
                    <i class="fas fa-${rec.icon}"></i>
                    <div class="action-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.message}</p>
                        <button class="btn btn-sm btn-outline-light" onclick="crowdManager.handleRecommendation(${rec.id})">
                            Take Action
                        </button>
                    </div>
                </div>
            `;
            actionList.insertAdjacentHTML('beforeend', recElement);
        });
    }

    handleRecommendation(id) {
        const rec = this.recommendations.find(r => r.id === id);
        if (rec) {
            // Simulate action handling
            rec.status = 'processing';
            this.showNotification(`Processing action: ${rec.title}`, 'success');
            this.updateRecommendations();
        }
    }

    startRealTimeUpdates() {
        // Update live count and density every second
        setInterval(() => {
            this.updateLiveStats();
        }, 1000);

        // Update main stats every 30 seconds
        setInterval(() => {
            this.simulateStatsChanges();
            this.updateDashboard();
        }, 30000);

        // Update density trend chart every 5 seconds
        setInterval(() => {
            this.updateDensityTrendChart();
        }, 5000);
    }

    updateLiveStats() {
        const count = Math.floor(300 + Math.random() * 100);
        const density = Math.floor(40 + Math.random() * 30);
        const flowRate = Math.floor(30 + Math.random() * 20);

        document.getElementById('liveCount').textContent = this.formatNumber(count);
        const densityLevel = document.getElementById('densityLevel');
        densityLevel.style.width = `${density}%`;
        densityLevel.textContent = `${density}%`;
        document.getElementById('flowRate').textContent = `${flowRate} people/min`;

        densityLevel.className = `progress-bar bg-${density > 80 ? 'danger' : density > 60 ? 'warning' : 'success'}`;
    }

    updateDensityTrendChart() {
        const newData = this.densityTrendChart.data.datasets[0].data.slice(1);
        newData.push(Math.random() * 2 + 2);
        this.densityTrendChart.data.datasets[0].data = newData;
        this.densityTrendChart.update();
    }

    simulateStatsChanges() {
        this.stats.totalCount += Math.floor(Math.random() * 200 - 100);
        this.stats.incidentCount += Math.floor(Math.random() * 3 - 1);
        this.stats.alertCount += Math.floor(Math.random() * 3 - 1);
        this.stats.avgDensity = +(this.stats.avgDensity + (Math.random() * 0.4 - 0.2)).toFixed(1);

        // Keep values within reasonable ranges
        this.stats.incidentCount = Math.max(0, Math.min(20, this.stats.incidentCount));
        this.stats.alertCount = Math.max(0, Math.min(10, this.stats.alertCount));
        this.stats.avgDensity = Math.max(1, Math.min(5, this.stats.avgDensity));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="alert alert-${type}" role="alert">
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crowdManager = new CrowdMonitoringManager();
});