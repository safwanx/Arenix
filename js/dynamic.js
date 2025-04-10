class DynamicPricingManager {
    constructor() {
      // Define match profiles and their base multipliers
      this.matchProfiles = {
        highProfile: {
          baseMultiplier: 1.3,  // 30% increase for high profile
          teams: ['Brazil', 'Argentina', 'France', 'Germany', 'Saudi Arabia']
        },
        mediumProfile: {
          baseMultiplier: 1.0,  // Base price for medium profile
          teams: ['Portugal', 'Netherlands', 'England', 'Italy', 'Belgium']
        },
        lowProfile: {
          baseMultiplier: 0.85,  // 15% decrease for low profile
          teams: ['Japan', 'Senegal', 'Mexico', 'Uruguay', 'Colombia']
        }
      };
  
      // Updated list of matches with profile property added
      this.matches = [
        {
          homeTeam: "Brazil",
          awayTeam: "Argentina",
          date: "2024-03-15",
          homeRating: 92,
          awayRating: 90,
          basePrice: 180,
          venueCapacity: 88000,
          expectedAttendance: 85000,
          profile: 'high'
        },
        {
          homeTeam: "France",
          awayTeam: "Germany",
          date: "2024-03-18",
          homeRating: 89,
          awayRating: 88,
          basePrice: 170,
          venueCapacity: 75000,
          expectedAttendance: 70000,
          profile: 'high'
        },
        {
          homeTeam: "England",
          awayTeam: "Saudi Arabia",
          date: "2024-03-20",
          homeRating: 87,
          awayRating: 88,
          basePrice: 175,
          venueCapacity: 82000,
          expectedAttendance: 78000,
          profile: 'high'
        },
        {
          homeTeam: "Portugal",
          awayTeam: "Netherlands",
          date: "2024-03-22",
          homeRating: 86,
          awayRating: 85,
          basePrice: 165,
          venueCapacity: 65000,
          expectedAttendance: 55000,
          profile: 'medium'
        },
        {
          homeTeam: "Italy",
          awayTeam: "Belgium",
          date: "2024-03-25",
          homeRating: 85,
          awayRating: 84,
          basePrice: 160,
          venueCapacity: 70000,
          expectedAttendance: 58000,
          profile: 'medium'
        },
        {
          homeTeam: "Switzerland",
          awayTeam: "Senegal",
          date: "2024-03-27",
          homeRating: 82,
          awayRating: 81,
          basePrice: 150,
          venueCapacity: 45000,
          expectedAttendance: 35000,
          profile: 'low'
        }
      ];
  
      // Define time ranges for different chart views
      this.currentView = 'day';
      this.timeRanges = {
        day: this.matches.slice(0, 3),
        week: this.matches.slice(0, 4),
        month: this.matches
      };
  
      this.initializeCharts();
      this.initializeEventListeners();
      this.updatePrices();
      this.startRealTimeUpdates();
    }
  
    // Determine match profile based on team participation
    getMatchProfile(match) {
      const isHighProfile = this.matchProfiles.highProfile.teams.includes(match.homeTeam) ||
        this.matchProfiles.highProfile.teams.includes(match.awayTeam);
      const isMediumProfile = this.matchProfiles.mediumProfile.teams.includes(match.homeTeam) ||
        this.matchProfiles.mediumProfile.teams.includes(match.awayTeam);
  
      if (isHighProfile) return 'highProfile';
      if (isMediumProfile) return 'mediumProfile';
      return 'lowProfile';
    }
  
    // Calculate team factor using ratings and profile multiplier
    calculateTeamFactor(match) {
      const baseTeamFactor = (match.homeRating + match.awayRating) / 200;
      const profile = this.getMatchProfile(match);
      const profileMultiplier = this.matchProfiles[profile].baseMultiplier;
      const teamFactor = baseTeamFactor * profileMultiplier;
      return Math.min(Math.max(teamFactor, 0.8), 1.5);
    }
  
    // Calculate venue factor including additional demand pressure
    calculateVenueFactor(capacity, expectedAttendance) {
      const venueFactor = Math.sqrt(expectedAttendance / capacity);
      const demandPressure = (expectedAttendance / capacity) > 0.9 ? 1.1 : 1.0;
      return Math.min(Math.max(venueFactor * demandPressure, 0.8), 1.2);
    }
  
    // Calculate the final ticket price with profile-based adjustments
    calculateFinalPrice(match) {
      const teamFactor = this.calculateTeamFactor(match);
      const venueFactor = this.calculateVenueFactor(match.venueCapacity, match.expectedAttendance);
  
      // Initial price calculation
      let finalPrice = match.basePrice * teamFactor * venueFactor;
  
      // Apply additional profile-specific adjustments
      const profile = this.getMatchProfile(match);
      if (profile === 'highProfile') {
        finalPrice *= 1.1; // Extra 10% increase for high profile matches
      } else if (profile === 'lowProfile') {
        finalPrice *= 0.9; // 10% reduction for low profile matches
      }
  
      // Enforce price constraints (50-300 SAR)
      finalPrice = Math.min(Math.max(finalPrice, 50), 300);
  
      return {
        finalPrice: Math.round(finalPrice),
        teamFactor: teamFactor.toFixed(2),
        venueFactor: venueFactor.toFixed(2),
        profile
      };
    }
  
    // Determine price status based on profile-specific thresholds
    getPriceStatus(match, finalPrice) {
      const profile = this.getMatchProfile(match);
      const basePrice = match.basePrice;
      const percentChange = ((finalPrice - basePrice) / basePrice) * 100;
  
      if (profile === 'highProfile') {
        return percentChange >= 20 ? 'High Demand' : 'Optimal';
      } else if (profile === 'mediumProfile') {
        return Math.abs(percentChange) <= 10 ? 'Optimal' : (percentChange > 10 ? 'High Demand' : 'Low Demand');
      } else {
        return percentChange <= -10 ? 'Low Demand' : 'Optimal';
      }
    }
  
    // Return a bootstrap badge class based on price status
    getStatusClass(status) {
      switch (status) {
        case 'High Demand': return 'bg-success';
        case 'Low Demand': return 'bg-danger';
        default: return 'bg-warning';
      }
    }
  
    // Update table of match prices
    updatePrices() {
      const tableBody = document.getElementById('matchTableBody');
      tableBody.innerHTML = '';
  
      this.matches.forEach(match => {
        const { finalPrice, teamFactor, venueFactor } = this.calculateFinalPrice(match);
        const status = this.getPriceStatus(match, finalPrice);
        const statusClass = this.getStatusClass(status);
  
        const row = `
          <tr>
            <td>${match.homeTeam} vs ${match.awayTeam}</td>
            <td>${match.date}</td>
            <td>${match.basePrice} SAR</td>
            <td>${teamFactor}x</td>
            <td>${venueFactor}x</td>
            <td class="fw-bold">
              Base: ${match.basePrice} SAR<br>
              <small class="text-muted">Final: ${finalPrice} SAR</small>
            </td>
            <td><span class="badge ${statusClass}">${status}</span></td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
  
      // Update the formula breakdown for the first match as an example
      if (this.matches.length > 0) {
        this.updateFormulaBreakdown(this.matches[0]);
      }
    }
  
    // Update UI breakdown of the pricing formula
    updateFormulaBreakdown(match) {
      const { finalPrice, teamFactor, venueFactor } = this.calculateFinalPrice(match);
  
      document.querySelector('.formula-item:nth-child(1) .value').textContent = `${match.basePrice} SAR`;
      document.querySelector('.formula-item:nth-child(2) .value').textContent = `${teamFactor}x`;
      document.querySelector('.formula-item:nth-child(3) .value').textContent = `${venueFactor}x`;
  
      document.querySelector('.formula-item:nth-child(1) .progress-bar').style.width = `${(match.basePrice / 300) * 100}%`;
      document.querySelector('.formula-item:nth-child(2) .progress-bar').style.width = `${(teamFactor / 1.5) * 100}%`;
      document.querySelector('.formula-item:nth-child(3) .progress-bar').style.width = `${(venueFactor / 1.2) * 100}%`;
    }
  
    // Initialize the Chart.js line chart for price trends
    initializeCharts() {
      const ctx = document.getElementById('priceTrendChart').getContext('2d');
      this.priceTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.matches.map(m => `${m.homeTeam} vs ${m.awayTeam}`),
          datasets: [
            {
              label: 'Final Price',
              data: this.matches.map(m => this.calculateFinalPrice(m).finalPrice),
              borderColor: '#B51AF7',
              tension: 0.4
            },
            {
              label: 'Base Price',
              data: this.matches.map(m => m.basePrice),
              borderColor: '#1A76F7',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
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
  
    // Set up event listeners for refreshing prices and chart views
    initializeEventListeners() {
      document.getElementById('refreshPrices').addEventListener('click', () => {
        this.simulateAttendanceChanges();
        this.updatePrices();
        this.updateChart();
      });
  
      // Time range view buttons
      document.querySelectorAll('[data-view]').forEach(button => {
        button.addEventListener('click', (e) => {
          document.querySelectorAll('[data-view]').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          this.updateChartView(e.target.dataset.view);
        });
      });
    }
  
    // Simulate real-time attendance changes with profile-dependent variation ranges
    simulateAttendanceChanges() {
      this.matches.forEach(match => {
        const profile = this.getMatchProfile(match);
        let variationRange;
        switch (profile) {
          case 'highProfile':
            variationRange = 0.1; // ±10% for high profile matches
            break;
          case 'mediumProfile':
            variationRange = 0.15; // ±15% for medium profile matches
            break;
          case 'lowProfile':
            variationRange = 0.2; // ±20% for low profile matches
            break;
          default:
            variationRange = 0.1;
        }
        const variation = (Math.random() * 2 - 1) * variationRange;
        match.expectedAttendance = Math.min(
          match.venueCapacity,
          Math.max(match.venueCapacity * 0.4, match.expectedAttendance * (1 + variation))
        );
      });
    }
  
    // Update the chart with the latest final prices
    updateChart() {
      this.priceTrendChart.data.datasets[0].data = this.matches.map(m =>
        this.calculateFinalPrice(m).finalPrice
      );
      this.priceTrendChart.update();
    }
  
    // Update the chart view based on selected time range (day, week, month)
    updateChartView(view) {
      this.currentView = view;
      const data = this.timeRanges[view];
  
      this.priceTrendChart.data.labels = data.map(m => `${m.homeTeam} vs ${m.awayTeam}`);
      this.priceTrendChart.data.datasets[0].data = data.map(m => this.calculateFinalPrice(m).finalPrice);
      this.priceTrendChart.data.datasets[1].data = data.map(m => m.basePrice);
  
      this.priceTrendChart.update();
    }
  
    // Start periodic real-time updates (every 30 seconds)
    startRealTimeUpdates() {
      setInterval(() => {
        this.simulateAttendanceChanges();
        this.updatePrices();
        this.updateChart();
      }, 30000);
    }
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    const pricingManager = new DynamicPricingManager();
  });
  