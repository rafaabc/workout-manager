import AuthService from './services/authService.js';
import apiService from './services/apiService.js';
import Validators from './utils/validators.js';
import { PAGES } from './utils/constants.js';
import Calendar from './components/calendar.js';
import Metrics from './components/metrics.js';
import Header from './components/header.js';

class App {
  constructor() {
    this.currentPage = PAGES.LOGIN;
    this.calendar = null;
    this.metrics = null;
    this.header = null;
  }

  async init() {
    // Listen for unauthorized events
    window.addEventListener('unauthorized', () => this.handleUnauthorized());

    // global network error handler will redirect to error page
    window.addEventListener('networkError', () => {
      window.location.href = 'index.html?page=error';
    });

    // Get the page from URL parameters
    const params = new URLSearchParams(window.location.search);
    const requestedPage = params.get('page');

    // Determine which page to show
    if (AuthService.isAuthenticated()) {
      this.showPage(PAGES.DASHBOARD);
    } else if (requestedPage === PAGES.REGISTER) {
      this.showPage(PAGES.REGISTER);
    } else {
      this.showPage(PAGES.LOGIN);
    }
  }

  /**
   * Show a specific page
   */
  async showPage(page) {
    this.currentPage = page;

    // Clear the app container
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Load and render the requested page
    try {
      const response = await fetch(`src/pages/${page}.html`);
      const html = await response.text();
      app.innerHTML = html;

      // Initialize page-specific logic
      switch (page) {
        case PAGES.LOGIN:
          this.initLoginPage();
          break;
        case PAGES.REGISTER:
          this.initRegisterPage();
          break;
        case PAGES.DASHBOARD:
          this.initDashboardPage();
          break;
        case PAGES.ERROR:
          // render error page inline to avoid additional network request
          app.innerHTML = `
            <div class="auth-container">
              <div class="auth-box">
                <h2>Oops!</h2>
                <p>There was a problem connecting to the server.</p>
                <p>Please check your internet connection or try again later.</p>
                <button class="btn-primary" id="retryBtn">Retry</button>
              </div>
            </div>
          `;
          document.getElementById('retryBtn').addEventListener('click', () => {
            window.location.href = 'index.html?page=login';
          });
          break;
      }
    } catch (error) {
      console.error('Failed to load page:', error);
      app.innerHTML = '<p class="error">Failed to load page</p>';
    }
  }

  /**
   * Initialize login page
   */
  initLoginPage() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Clear previous errors
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      try {
        const response = await apiService.login(username, password);

        // Save token and user info
        AuthService.saveToken(response.token, username);

        // Redirect to dashboard
        window.location.href = 'index.html?page=dashboard';
      } catch (error) {
        // Error message comes from the API response
        const errorMessage = error.message || 'Login failed. Please try again.';
        // network errors trigger redirect event, skip showing message
        if (errorMessage.toLowerCase().includes('network error')) {
          return;
        }
        console.error('Login error details:', {
          message: error.message,
          status: error.status,
          data: error.data,
          fullError: error,
        });
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
      }
    });
  }

  /**
   * Initialize register page
   */
  initRegisterPage() {
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Clear previous errors
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      // Validate username
      const usernameValidation = Validators.validateUsername(username);
      if (!usernameValidation.isValid) {
        errorDiv.textContent = usernameValidation.message;
        errorDiv.style.display = 'block';
        return;
      }

      // Validate password
      const passwordValidation = Validators.validatePassword(password);
      if (!passwordValidation.isValid) {
        errorDiv.textContent = passwordValidation.message;
        errorDiv.style.display = 'block';
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
      }

      try {
        await apiService.register(username, password);

        // Show success message and redirect to login
        const app = document.getElementById('app');
        app.innerHTML = `
          <div class="auth-container">
            <div class="auth-box success">
              <h2>Registration Successful!</h2>
              <p>Your account has been created. You can now login.</p>
              <a href="index.html?page=login" class="btn-primary">Go to Login</a>
            </div>
          </div>
        `;
      } catch (error) {
        const errorMessage = error.message || 'Registration failed. Please try again.';
        if (errorMessage.toLowerCase().includes('network error')) {
          return;
        }
        console.error('Registration error details:', {
          message: error.message,
          status: error.status,
          data: error.data,
          fullError: error,
        });
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
      }
    });
  }

  /**
   * Initialize dashboard page
   */
  async initDashboardPage() {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      window.location.href = 'index.html?page=login';
      return;
    }

    // Initialize header
    this.header = new Header('headerContainer');
    this.header.render();

    // Initialize calendar
    this.calendar = new Calendar('calendarContainer', () => this.onWorkoutChange());
    await this.calendar.loadWorkouts();

    // Initialize metrics
    this.metrics = new Metrics('metricsContainer');
    await this.metrics.loadMetrics();

    // Listen for metrics updates
    window.addEventListener('metricsUpdated', () => {
      this.onWorkoutChange();
    });
  }

  /**
   * Called when workouts change
   */
  async onWorkoutChange() {
    if (this.metrics) {
      await this.metrics.refresh();
    }
  }

  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    AuthService.clearAuth();
    window.location.href = 'index.html?page=login';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
