import apiService from '../services/apiService.js';
import { MONTHS } from '../utils/constants.js';

class Calendar {
  constructor(container, onWorkoutChange) {
    this.container = container;
    this.onWorkoutChange = onWorkoutChange;
    this.currentDate = new Date();
    this.workouts = [];
    this.isLoading = false;
  }

  async loadWorkouts() {
    try {
      this.isLoading = true;
      const month = this.currentDate.getMonth() + 1;
      const year = this.currentDate.getFullYear();

      const response = await apiService.getWorkoutsByMonth(month, year);
      let workouts = [];
      if (Array.isArray(response)) {
        workouts = response;
      } else {
        workouts = response.workouts || [];
      }

      // Normalize numeric fields so comparisons work reliably
      this.workouts = workouts.map(w => ({
        day: Number(w.day),
        month: Number(w.month),
        year: Number(w.year),
      }));
      this.render();
    } catch (error) {
      const errorMsg = error.message || 'Failed to load workouts';
      this.showError(errorMsg);
      console.error('Error loading workouts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check if a day has a workout
   */
  hasWorkout(day) {
    const d = Number(day);
    return this.workouts.some(w => w.day === d);
  }

  /**
   * Get the first day of the current month (0-6)
   */
  getFirstDayOfMonth() {
    return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
  }

  /**
   * Get the number of days in the current month
   */
  getDaysInMonth() {
    return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
  }

  /**
   * Navigate to previous month
   */
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.loadWorkouts();
  }

  /**
   * Navigate to next month
   */
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.loadWorkouts();
  }

  /**
   * Go to current month
   */
  goToCurrentMonth() {
    this.currentDate = new Date();
    this.loadWorkouts();
  }

  /**
   * Toggle workout on a specific day
   */
  async toggleWorkout(day) {
    try {
      const month = this.currentDate.getMonth() + 1;
      const year = this.currentDate.getFullYear();

      if (this.hasWorkout(day)) {
        await apiService.unmarkWorkout(day, month, year);
      } else {
        await apiService.markWorkout(day, month, year);
      }

      await this.loadWorkouts();
      this.onWorkoutChange();
    } catch (error) {
      // network errors are handled by global listener; avoid duplicate popups
      if (error.message && error.message.toLowerCase().includes('network error')) {
        console.error('Network error detected, redirecting...', error);
        return;
      }
      this.showError(error.message || 'Failed to update workout');
      console.error('Error toggling workout:', error);
    }
  }

  /**
   * Render the calendar
   */
  render() {
    const container = document.getElementById(this.container);
    container.innerHTML = '';

    const calendarHTML = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="calendar-nav-btn" id="prevBtn">← Previous</button>
          <h2 class="calendar-title">
            ${MONTHS[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}
          </h2>
          <button class="calendar-nav-btn" id="nextBtn">Next →</button>
        </div>

        <div class="calendar-today">
          <button class="today-btn" id="todayBtn">Today</button>
        </div>

        <div class="calendar-days-header">
          <div class="day-header">Sun</div>
          <div class="day-header">Mon</div>
          <div class="day-header">Tue</div>
          <div class="day-header">Wed</div>
          <div class="day-header">Thu</div>
          <div class="day-header">Fri</div>
          <div class="day-header">Sat</div>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>
      </div>
    `;

    container.innerHTML = calendarHTML;

    // Render calendar grid
    this.renderCalendarGrid();

    // Add event listeners
    document.getElementById('prevBtn').addEventListener('click', () => this.previousMonth());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextMonth());
    document.getElementById('todayBtn').addEventListener('click', () => this.goToCurrentMonth());
  }

  /**
   * Render calendar grid with days
   */
  renderCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    const firstDay = this.getFirstDayOfMonth();
    const daysInMonth = this.getDaysInMonth();

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      grid.appendChild(emptyCell);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      dayCell.textContent = day;

      if (this.hasWorkout(day)) {
        dayCell.classList.add('workout');
      }

      dayCell.addEventListener('click', () => this.toggleWorkout(day));
      grid.appendChild(dayCell);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById(this.container);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

export default Calendar;
