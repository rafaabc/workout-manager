import ApiService from '../../../src/services/apiService.js';
import AuthService from '../../../src/services/authService.js';
import { TOKEN_KEY, API_BASE_URL, ENDPOINTS, HTTP_STATUS } from '../../../src/utils/constants.js';

// The default export is an instance; we need the class for some tests
const apiService = ApiService;

describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    // Reset any custom event listeners
  });

  // ====== getAuthHeaders ======
  describe('getAuthHeaders', () => {
    test('should return headers without Authorization when no token is stored', () => {
      // Arrange — no token in localStorage

      // Act
      const headers = apiService.getAuthHeaders();

      // Assert
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });

    test('should return headers with Bearer token when token exists', () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'fake-jwt-token');

      // Act
      const headers = apiService.getAuthHeaders();

      // Assert
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer fake-jwt-token');
    });
  });

  // ====== handleResponse ======
  describe('handleResponse', () => {
    test('should return parsed JSON on successful response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'success' }),
      };

      // Act
      const result = await apiService.handleResponse(mockResponse);

      // Assert
      expect(result).toEqual({ message: 'success' });
    });

    test('should throw error with message from API on 400 response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: 'Bad request data' }),
      };

      // Act & Assert
      await expect(apiService.handleResponse(mockResponse)).rejects.toThrow('Bad request data');
    });

    test('should throw error with message field when error field is absent', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Validation failed' }),
      };

      // Act & Assert
      await expect(apiService.handleResponse(mockResponse)).rejects.toThrow('Validation failed');
    });

    test('should throw error with HTTP status when no message fields exist', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({}),
      };

      // Act & Assert
      await expect(apiService.handleResponse(mockResponse)).rejects.toThrow('HTTP 404');
    });

    test('should throw error on 401 unauthorized response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      };

      // Act & Assert
      await expect(apiService.handleResponse(mockResponse)).rejects.toThrow('Unauthorized');
    });

    test('should throw parse error when JSON parsing fails', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      };

      // Act & Assert
      await expect(apiService.handleResponse(mockResponse)).rejects.toThrow(
        'Failed to parse API response'
      );
    });
  });

  // ====== request ======
  describe('request', () => {
    test('should make a successful GET request', async () => {
      // Arrange
      const responseData = { workouts: [] };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(responseData),
      });

      // Act
      const result = await apiService.request('/test', { method: 'GET' });

      // Assert
      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('should make a successful POST request with body', async () => {
      // Arrange
      const responseData = { id: 1 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(responseData),
      });
      const body = JSON.stringify({ name: 'test' });

      // Act
      const result = await apiService.request('/test', { method: 'POST', body });

      // Assert
      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({ method: 'POST', body })
      );
    });

    test('should include auth token in request headers', async () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'my-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await apiService.request('/test');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });

    test('should dispatch networkError event on network failure', async () => {
      // Arrange
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const networkErrorHandler = jest.fn();
      window.addEventListener('networkError', networkErrorHandler);

      // Act & Assert
      await expect(apiService.request('/test')).rejects.toThrow(
        'Network error. Please check your connection.'
      );
      expect(networkErrorHandler).toHaveBeenCalled();

      // Cleanup
      window.removeEventListener('networkError', networkErrorHandler);
    });

    test('should dispatch unauthorized event and clear token on 401', async () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'expired-token');
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Token expired' }),
      });
      const unauthorizedHandler = jest.fn();
      window.addEventListener('unauthorized', unauthorizedHandler);

      // Act & Assert
      await expect(apiService.request('/test')).rejects.toThrow('Token expired');
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(unauthorizedHandler).toHaveBeenCalled();

      // Cleanup
      window.removeEventListener('unauthorized', unauthorizedHandler);
    });

    test('should throw error on 500 server error', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Internal server error' }),
      });

      // Act & Assert
      await expect(apiService.request('/test')).rejects.toThrow('Internal server error');
    });
  });

  // ====== formatError ======
  describe('formatError', () => {
    test('should return the same Error instance if already an Error', () => {
      // Arrange
      const error = new Error('something went wrong');

      // Act
      const result = apiService.formatError(error);

      // Assert
      expect(result).toBe(error);
    });

    test('should wrap non-Error object in an Error', () => {
      // Arrange
      const errorObj = { message: 'something failed' };

      // Act
      const result = apiService.formatError(errorObj);

      // Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('something failed');
    });

    test('should wrap unknown error with default message', () => {
      // Arrange
      const errorObj = {};

      // Act
      const result = apiService.formatError(errorObj);

      // Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error');
    });
  });

  // ====== Auth endpoint methods ======
  describe('register', () => {
    test('should call request with correct endpoint and body', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ message: 'User registered' }),
      });

      // Act
      const result = await apiService.register('john', 'pass1234');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.AUTH.REGISTER}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'john', password: 'pass1234' }),
        })
      );
      expect(result.message).toBe('User registered');
    });
  });

  describe('login', () => {
    test('should call request with correct endpoint and body', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ token: 'jwt-token' }),
      });

      // Act
      const result = await apiService.login('john', 'pass1234');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'john', password: 'pass1234' }),
        })
      );
      expect(result.token).toBe('jwt-token');
    });

    test('should throw error on invalid credentials', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
      });

      // Act & Assert
      await expect(apiService.login('john', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    test('should call logout endpoint with POST method', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Logged out' }),
      });

      // Act
      const result = await apiService.logout();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`,
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.message).toBe('Logged out');
    });
  });

  // ====== Workout endpoint methods ======
  describe('getWorkoutsByMonth', () => {
    test('should call correct endpoint with month and year params', async () => {
      // Arrange
      const workouts = [{ day: 1, month: 3, year: 2026 }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ workouts }),
      });

      // Act
      const result = await apiService.getWorkoutsByMonth(3, 2026);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${ENDPOINTS.WORKOUTS.CALENDAR}?month=3&year=2026`),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.workouts).toEqual(workouts);
    });
  });

  describe('markWorkout', () => {
    test('should call calendar endpoint with POST and correct body', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ message: 'Workout marked' }),
      });

      // Act
      const result = await apiService.markWorkout(15, 3, 2026);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.WORKOUTS.CALENDAR}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ day: 15, month: 3, year: 2026 }),
        })
      );
      expect(result.message).toBe('Workout marked');
    });
  });

  describe('unmarkWorkout', () => {
    test('should call calendar endpoint with DELETE and correct body', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Workout removed' }),
      });

      // Act
      const result = await apiService.unmarkWorkout(15, 3, 2026);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.WORKOUTS.CALENDAR}`,
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ day: 15, month: 3, year: 2026 }),
        })
      );
      expect(result.message).toBe('Workout removed');
    });
  });

  // ====== Metrics endpoint methods ======
  describe('getMetrics', () => {
    test('should call metrics endpoint with GET', async () => {
      // Arrange
      const metricsData = { goal: 200, monthlyData: [] };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(metricsData),
      });

      // Act
      const result = await apiService.getMetrics();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.METRICS.GET}`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(metricsData);
    });
  });

  describe('setGoal', () => {
    test('should call set goal endpoint with POST and goal value', async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ goal: 200 }),
      });

      // Act
      const result = await apiService.setGoal(200);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${ENDPOINTS.METRICS.SET_GOAL}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ goal: 200 }),
        })
      );
      expect(result.goal).toBe(200);
    });
  });
});

// ====== AuthService ======
describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToken', () => {
    test('should store token and username in localStorage', () => {
      // Arrange
      const token = 'test-jwt-token';
      const username = 'john';

      // Act
      AuthService.saveToken(token, username);

      // Assert
      expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
      expect(localStorage.getItem('workout_user')).toBe(username);
    });
  });

  describe('getToken', () => {
    test('should return stored token', () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'my-token');

      // Act
      const token = AuthService.getToken();

      // Assert
      expect(token).toBe('my-token');
    });

    test('should return null when no token is stored', () => {
      // Act
      const token = AuthService.getToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('getUsername', () => {
    test('should return stored username', () => {
      // Arrange
      localStorage.setItem('workout_user', 'jane');

      // Act
      const username = AuthService.getUsername();

      // Assert
      expect(username).toBe('jane');
    });

    test('should return null when no username is stored', () => {
      // Act
      const username = AuthService.getUsername();

      // Assert
      expect(username).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'valid-token');

      // Act
      const result = AuthService.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when no token exists', () => {
      // Act
      const result = AuthService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clearAuth', () => {
    test('should remove token and username from localStorage', () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'token');
      localStorage.setItem('workout_user', 'john');

      // Act
      AuthService.clearAuth();

      // Assert
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem('workout_user')).toBeNull();
    });
  });

  describe('getUserInfo', () => {
    test('should return user info with username and authenticated status', () => {
      // Arrange
      localStorage.setItem(TOKEN_KEY, 'token');
      localStorage.setItem('workout_user', 'john');

      // Act
      const info = AuthService.getUserInfo();

      // Assert
      expect(info.username).toBe('john');
      expect(info.isAuthenticated).toBe(true);
    });

    test('should return null username and false authenticated when not logged in', () => {
      // Act
      const info = AuthService.getUserInfo();

      // Assert
      expect(info.username).toBeNull();
      expect(info.isAuthenticated).toBe(false);
    });
  });
});
