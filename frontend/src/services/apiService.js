import { API_BASE_URL, ENDPOINTS, HTTP_STATUS, TOKEN_KEY } from '../utils/constants.js';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get authorization header with JWT token
   */
  getAuthHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response errors
   */
  async handleResponse(response) {
    try {
      const data = await response.json();

      if (!response.ok) {
        // Extract error message - try multiple fields
        const errorMessage = data?.error || data?.message || `HTTP ${response.status}`;

        console.error('API Error Response:', {
          status: response.status,
          message: errorMessage,
          data: data,
        });

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (e) {
      // If it's already an API error with status, re-throw it
      if (e.status) {
        throw e;
      }

      // Handle JSON parsing or other errors
      console.error('Response parsing error:', e);
      const error = new Error('Failed to parse API response');
      error.status = response.status || 500;
      throw error;
    }
  }

  /**
   * Make a generic HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: this.getAuthHeaders(),
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      // Network-level errors (e.g. DNS failure, server down)
      if (error instanceof TypeError || error.message === 'Failed to fetch') {
        const netErr = new Error('Network error. Please check your connection.');
        netErr.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        // notify app to redirect to error page
        globalThis.dispatchEvent(new Event('networkError'));
        throw netErr;
      }
      // Handle special cases for thrown errors
      if (error.status === HTTP_STATUS.UNAUTHORIZED) {
        localStorage.removeItem(TOKEN_KEY);
        globalThis.dispatchEvent(new Event('unauthorized'));
      }
      throw error;
    }
  }

  /**
   * Format error response (deprecated - errors now handled in request and handleResponse)
   */
  formatError(error) {
    // This method is maintained for backward compatibility but errors are handled upstream
    if (!(error instanceof Error)) {
      return new Error(error?.message || 'Unknown error');
    }
    return error;
  }

  // ====== AUTH ENDPOINTS ======

  /**
   * Register a new user
   */
  async register(username, password) {
    return this.request(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Login user
   */
  async login(username, password) {
    return this.request(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Logout user
   */
  async logout() {
    return this.request(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  // ====== WORKOUTS ENDPOINTS ======

  /**
   * Get workouts for a specific month/year
   */
  async getWorkoutsByMonth(month, year) {
    const params = new URLSearchParams({ month, year });
    return this.request(`${ENDPOINTS.WORKOUTS.CALENDAR}?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Mark a workout on a specific day
   */
  async markWorkout(day, month, year) {
    return this.request(ENDPOINTS.WORKOUTS.CALENDAR, {
      method: 'POST',
      body: JSON.stringify({ day, month, year }),
    });
  }

  /**
   * Unmark a workout on a specific day
   */
  async unmarkWorkout(day, month, year) {
    return this.request(ENDPOINTS.WORKOUTS.CALENDAR, {
      method: 'DELETE',
      body: JSON.stringify({ day, month, year }),
    });
  }

  // ====== METRICS ENDPOINTS ======

  /**
   * Get user metrics
   */
  async getMetrics() {
    return this.request(ENDPOINTS.METRICS.GET, {
      method: 'GET',
    });
  }

  /**
   * Set annual workout goal
   */
  async setGoal(goal) {
    return this.request(ENDPOINTS.METRICS.SET_GOAL, {
      method: 'POST',
      body: JSON.stringify({ goal }),
    });
  }
}

export default new ApiService();
