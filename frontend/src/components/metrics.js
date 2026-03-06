import apiService from '../services/apiService.js';
import { MONTHS } from '../utils/constants.js';
import Validators from '../utils/validators.js';

class Metrics {
  constructor(container) {
    this.container = container;
    this.metrics = null;
    this.isLoading = false;
  }

  async loadMetrics() {
    try {
      this.isLoading = true;
      const response = await apiService.getMetrics();
      this.metrics = response;
      this.render();
    } catch (error) {
      const errorMsg = error.message || 'Failed to load metrics';
      this.showError(errorMsg);
      console.error('Error loading metrics:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculate total workouts for the year
   */
  calculateTotalWorkouts() {
    if (!this.metrics || !this.metrics.monthlyData) return 0;
    return this.metrics.monthlyData.reduce((total, month) => total + (month.totalWorkouts || 0), 0);
  }

  /**
   * Calculate annual progress percentage
   */
  calculateAnnualProgress() {
    if (!this.metrics || !this.metrics.goal || this.metrics.goal === 0) return 0;
    const total = this.calculateTotalWorkouts();
    return Math.round((total / this.metrics.goal) * 100);
  }

  /**
   * Calculate monthly progress percentage
   */
  calculateMonthlyProgress(monthIndex) {
    if (!this.metrics || !this.metrics.monthlyData) return 0;

    const monthData = this.metrics.monthlyData[monthIndex];
    if (!monthData) return 0;

    const monthlyGoal = this.metrics.goal ? Math.floor(this.metrics.goal / 12) : 0;
    if (monthlyGoal === 0) return 0;

    return Math.round((monthData.totalWorkouts / monthlyGoal) * 100);
  }

  /**
   * Render the metrics panel
   */
  render() {
    const container = document.getElementById(this.container);
    if (!container) {
      console.error(`Metrics: container '#${this.container}' not found in DOM`);
      return;
    }
    container.innerHTML = '';

    if (!this.metrics) {
      container.innerHTML = '<p class="error">Unable to load metrics</p>';
      return;
    }

    const metricsHTML = `
      <div class="metrics-container">
        <div class="metrics-header">
          <h2>Annual Metrics</h2>
          <div class="goal-section">
            <label for="goalInput">Annual Goal: </label>
            <div class="goal-input-group">
              <input 
                type="number" 
                id="goalInput" 
                class="goal-input" 
                value="${this.metrics.goal || 0}"
                min="1"
                placeholder="Enter annual goal"
              />
              <button id="saveGoalBtn" class="save-goal-btn">Save Goal</button>
            </div>
            <p id="goalError" class="error-message" style="display: none;"></p>
          </div>
        </div>

        <div class="metrics-summary">
          <div class="summary-item">
            <div class="summary-label">Annual Goal</div>
            <div class="summary-value">${this.metrics.goal || 0}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Workouts</div>
            <div class="summary-value">${this.calculateTotalWorkouts()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Progress</div>
            <div class="summary-value">${this.calculateAnnualProgress()}%</div>
          </div>
        </div>

        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Workouts</th>
                <th>Monthly Goal</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody id="metricsTableBody">
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = metricsHTML;

    // Render table rows
    this.renderTableRows();

    // Add event listeners
    document.getElementById('saveGoalBtn').addEventListener('click', () => this.handleSaveGoal());
  }

  /**
   * Render table rows with monthly data
   */
  renderTableRows() {
    const tbody = document.getElementById('metricsTableBody');
    tbody.innerHTML = '';

    for (let i = 0; i < 12; i++) {
      const monthData = this.metrics.monthlyData[i] || { totalWorkouts: 0 };
      const monthlyGoal = this.metrics.goal ? Math.floor(this.metrics.goal / 12) : 0;
      const progress = this.calculateMonthlyProgress(i);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${MONTHS[i]}</td>
        <td>${monthData.totalWorkouts}</td>
        <td>${monthlyGoal}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <span class="progress-text">${progress}%</span>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    }
  }

  /**
   * Handle save goal
   */
  async handleSaveGoal() {
    const goalInput = document.getElementById('goalInput');
    const errorDiv = document.getElementById('goalError');

    const validation = Validators.validateGoal(goalInput.value);

    if (!validation.isValid) {
      errorDiv.textContent = validation.message;
      errorDiv.style.display = 'block';
      return;
    }

    try {
      const goal = Number(goalInput.value);
      const response = await apiService.setGoal(goal);

      this.metrics.goal = response.goal;
      errorDiv.style.display = 'none';

      // Reload metrics to update the display
      await this.loadMetrics();

      // Dispatch event to notify other components
      globalThis.dispatchEvent(new Event('metricsUpdated'));
    } catch (error) {
      errorDiv.textContent = error.message || 'Failed to save goal';
      errorDiv.style.display = 'block';
      console.error('Error saving goal:', error);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById(this.container);
    if (!container) {
      console.error(`Metrics showError: container '#${this.container}' not found`, message);
      return;
    }
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
  }

  /**
   * Refresh metrics (called when workouts change)
   */
  async refresh() {
    await this.loadMetrics();
  }
}

export default Metrics;
