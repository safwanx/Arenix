// DynamicPricingML - Handles interaction with the ML model for ticket pricing
class DynamicPricingML {
    constructor() {
      // API endpoint for predictions
      this.apiEndpoint = '/api/predict-price';
      
      // Store prediction history
      this.predictionHistory = [];
      
      // Track selected match type
      this.selectedMatchType = null;
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Initialize attendance slider
      this.initializeAttendanceSlider();
      
      // Add example predictions
      this.addExamplePredictions();
    }
  
    // Set up event listeners
    initializeEventListeners() {
      // Form submission
      document.getElementById('price-calculator-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculatePrice();
      });
      
      // Team selection events
      document.getElementById('team1').addEventListener('change', () => this.updateTeamVisuals());
      document.getElementById('team2').addEventListener('change', () => this.updateTeamVisuals());
      
      // Match type selection
      const matchTypeCards = document.querySelectorAll('.match-type-card');
      matchTypeCards.forEach(card => {
        card.addEventListener('click', () => {
          // Remove selection from all cards
          matchTypeCards.forEach(c => c.classList.remove('selected'));
          
          // Add selection to clicked card
          card.classList.add('selected');
          
          // Store selected match type and importance
          const matchType = card.dataset.matchType;
          const matchImportance = card.dataset.importance;
          
          // Update hidden input
          document.getElementById('match-type').value = matchType;
          
          // Update feature importance display
          this.updateMatchImportanceDisplay(matchImportance);
        });
      });
    }
    
    // Initialize attendance slider
    initializeAttendanceSlider() {
      const slider = document.getElementById('attendance-slider');
      const valueDisplay = document.getElementById('attendance-value');
      
      slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value + '%';
        this.updateAttendanceDisplay(slider.value);
      });
      
      // Set initial value
      valueDisplay.textContent = slider.value + '%';
      this.updateAttendanceDisplay(slider.value);
    }
    
    // Update team visuals when teams are selected
    updateTeamVisuals() {
      const team1Select = document.getElementById('team1');
      const team2Select = document.getElementById('team2');
      
      if (team1Select.selectedIndex > 0 && team2Select.selectedIndex > 0) {
        // Get selected team names
        const team1Name = team1Select.options[team1Select.selectedIndex].value;
        const team2Name = team2Select.options[team2Select.selectedIndex].value;
        
        // Extract strength values from the option text
        const team1Strength = this.extractStrengthFromOption(team1Select.options[team1Select.selectedIndex].text);
        const team2Strength = this.extractStrengthFromOption(team2Select.options[team2Select.selectedIndex].text);
        
        // Update the match visual
        document.getElementById('team1-display').textContent = team1Name;
        document.getElementById('team1-strength-display').textContent = `Strength: ${team1Strength.toFixed(2)}`;
        
        document.getElementById('team2-display').textContent = team2Name;
        document.getElementById('team2-strength-display').textContent = `Strength: ${team2Strength.toFixed(2)}`;
        
        // Show the match visual
        document.getElementById('match-visual').style.display = 'flex';
        
        // Calculate average strength
        const avgStrength = (team1Strength + team2Strength) / 2;
        
        // Calculate strength difference
        const strengthDiff = Math.abs(team1Strength - team2Strength);
        
        // Update feature importance bars
        document.getElementById('feature-team-strength-value').textContent = avgStrength.toFixed(2);
        document.getElementById('feature-team-strength-bar').style.width = `${avgStrength * 100}%`;
        
        document.getElementById('feature-team-diff-value').textContent = strengthDiff.toFixed(2);
        document.getElementById('feature-team-diff-bar').style.width = `${strengthDiff * 100}%`;
      } else {
        // Hide the match visual if not both teams are selected
        document.getElementById('match-visual').style.display = 'none';
      }
    }
    
    // Extract strength value from option text (format: "Team Name (Strength: 0.XX)")
    extractStrengthFromOption(optionText) {
      const match = optionText.match(/Strength: ([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    
    // Update attendance display
    updateAttendanceDisplay(value) {
      document.getElementById('feature-attendance-value').textContent = (value / 100).toFixed(2);
      document.getElementById('feature-attendance-bar').style.width = `${value}%`;
    }
    
    // Update match importance display
    updateMatchImportanceDisplay(importanceValue) {
      document.getElementById('feature-match-importance-value').textContent = importanceValue;
      document.getElementById('feature-match-importance-bar').style.width = `${parseFloat(importanceValue) * 100}%`;
    }
    
    // Calculate price using the ML model
    async calculatePrice() {
      // Get form values
      const team1 = document.getElementById('team1').value;
      const team2 = document.getElementById('team2').value;
      const matchType = document.getElementById('match-type').value;
      const attendancePercentage = document.getElementById('attendance-slider').value;
      const basePrice = document.getElementById('base-price').value;
      
      // Validate inputs
      if (!team1 || !team2 || !matchType) {
        alert('Please select both teams and match type');
        return;
      }
      
      try {
        // Prepare data for API
        const requestData = {
          team1: team1,
          team2: team2,
          match_type: matchType,
          attendance_percentage: attendancePercentage,
          base_price: basePrice
        };
        
        // Show loading state
        this.setLoadingState(true);
        
        // Make API request
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse response
        const result = await response.json();
        
        if (result.success) {
          // Update UI with prediction results
          this.displayPredictionResult(result);
          
          // Add to prediction history
          this.addToPredictionHistory(result);
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error calculating price:', error);
        alert('Error calculating price: ' + error.message);
      } finally {
        // Reset loading state
        this.setLoadingState(false);
      }
    }
    
    // Set loading state during API calls
    setLoadingState(isLoading) {
      const calculateButton = document.querySelector('.btn-calculate');
      
      if (isLoading) {
        calculateButton.disabled = true;
        calculateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
      } else {
        calculateButton.disabled = false;
        calculateButton.innerHTML = '<i class="fas fa-robot"></i> Calculate ML Price';
      }
    }
    
    // Display prediction result
    displayPredictionResult(result) {
      // Show results container
      const resultsContainer = document.getElementById('results-container');
      resultsContainer.style.display = 'block';
      
      // Add the visible class to trigger animation
      setTimeout(() => {
        resultsContainer.classList.add('visible');
      }, 100);
      
      // Update the prediction cards
      document.getElementById('result-base-price').textContent = `${result.base_price} SAR`;
      document.getElementById('result-multiplier').textContent = `${result.price_multiplier.toFixed(2)}x`;
      document.getElementById('result-final-price').textContent = `${Math.round(result.final_price)} SAR`;
      
      // Calculate price change percentage
      const priceChange = ((result.final_price - result.base_price) / result.base_price) * 100;
      const priceChangeElement = document.getElementById('price-change-text');
      
      if (priceChange >= 0) {
        priceChangeElement.className = 'positive-change';
        priceChangeElement.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(priceChange).toFixed(1)}%`;
      } else {
        priceChangeElement.className = 'negative-change';
        priceChangeElement.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(priceChange).toFixed(1)}%`;
      }
      
      // Set multiplier status badge
      const statusBadge = document.getElementById('prediction-status');
      const status = this.getPriceStatus(result.price_multiplier);
      statusBadge.textContent = status;
      
      if (status === 'High Demand') {
        statusBadge.className = 'badge badge-high';
      } else if (status === 'Low Demand') {
        statusBadge.className = 'badge badge-low';
      } else {
        statusBadge.className = 'badge badge-optimal';
      }
      
      // Update prediction explanation
      document.getElementById('prediction-explanation').innerHTML = `
        Based on ML analysis of team strengths, attendance, and match importance, the optimal price for 
        <strong>${result.inputs.team1} vs ${result.inputs.team2}</strong> is 
        <strong>${Math.round(result.final_price)} SAR</strong>.
        <br><br>
        The model analyzed these key factors:
        <ul>
          <li>Average Team Strength: ${result.inputs.avg_team_strength.toFixed(2)}</li>
          <li>Team Strength Difference: ${result.inputs.team_strength_diff.toFixed(2)}</li>
          <li>Attendance: ${(result.inputs.attendance_percentage * 100).toFixed(0)}%</li>
          <li>Match Importance: ${result.inputs.match_importance.toFixed(2)}</li>
        </ul>
      `;
    }
    
    // Add prediction to history table
    addToPredictionHistory(result) {
      // Format match type for display
      const matchTypeSelect = document.getElementById('match-type');
      const matchTypeDisplay = matchTypeSelect.value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Create a new entry for the prediction history
      const prediction = {
        match: `${result.inputs.team1} vs ${result.inputs.team2}`,
        matchType: matchTypeDisplay,
        attendance: `${(result.inputs.attendance_percentage * 100).toFixed(0)}%`,
        basePrice: `${result.base_price} SAR`,
        multiplier: result.price_multiplier.toFixed(2) + 'x',
        finalPrice: `${Math.round(result.final_price)} SAR`,
        status: this.getPriceStatus(result.price_multiplier)
      };
      
      // Add to the beginning of the history array
      this.predictionHistory.unshift(prediction);
      
      // Limit history to 10 items
      if (this.predictionHistory.length > 10) {
        this.predictionHistory.pop();
      }
      
      // Update the table
      this.updatePredictionHistoryTable();
    }
    
    // Update the prediction history table
    updatePredictionHistoryTable() {
      const tableBody = document.getElementById('predictions-tbody');
      
      if (this.predictionHistory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No predictions yet. Calculate a price to see history.</td></tr>';
        return;
      }
      
      // Clear the table
      tableBody.innerHTML = '';
      
      // Add each prediction to the table
      this.predictionHistory.forEach(prediction => {
        const badgeClass = this.getStatusBadgeClass(prediction.status);
        
        const row = `
          <tr>
            <td>${prediction.match}</td>
            <td>${prediction.matchType}</td>
            <td>${prediction.attendance}</td>
            <td>${prediction.basePrice}</td>
            <td>${prediction.multiplier}</td>
            <td class="fw-bold">${prediction.finalPrice}</td>
            <td><span class="badge ${badgeClass}">${prediction.status}</span></td>
          </tr>
        `;
        
        tableBody.innerHTML += row;
      });
    }
    
    // Get price status based on multiplier
    getPriceStatus(multiplier) {
      if (multiplier > 1.5) {
        return 'High Demand';
      } else if (multiplier < 0.8) {
        return 'Low Demand';
      } else {
        return 'Optimal';
      }
    }
    
    // Get status badge class
    getStatusBadgeClass(status) {
      switch (status) {
        case 'High Demand':
          return 'badge-high';
        case 'Low Demand':
          return 'badge-low';
        default:
          return 'badge-optimal';
      }
    }
    
    // Add some example predictions to demonstrate the UI
    addExamplePredictions() {
      const examplePredictions = [
        {
          match: "Brazil vs Argentina",
          matchType: "Final",
          attendance: "98%",
          basePrice: "200 SAR",
          multiplier: "1.87x",
          finalPrice: "374 SAR",
          status: "High Demand"
        },
        {
          match: "France vs Germany",
          matchType: "Semi Finals",
          attendance: "92%",
          basePrice: "180 SAR",
          multiplier: "1.65x",
          finalPrice: "297 SAR",
          status: "High Demand"
        },
        {
          match: "England vs Spain",
          matchType: "Quarter Finals",
          attendance: "85%",
          basePrice: "150 SAR",
          multiplier: "1.42x",
          finalPrice: "213 SAR",
          status: "Optimal"
        }
      ];
      
      // Add examples to history
      this.predictionHistory = examplePredictions;
      
      // Update the table
      this.updatePredictionHistoryTable();
    }
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    const pricingML = new DynamicPricingML();
  });