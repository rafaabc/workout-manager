import { TOKEN_KEY, USER_KEY } from '../utils/constants.js';

class AuthService {
  /**
   * Save user token and data
   */
  static saveToken(token, username) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username);
  }

  /**
   * Get stored token
   */
  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored username
   */
  static getUsername() {
    return localStorage.getItem(USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Clear token and user data
   */
  static clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Get user info
   */
  static getUserInfo() {
    return {
      username: this.getUsername(),
      isAuthenticated: this.isAuthenticated(),
    };
  }
}

export default AuthService;
