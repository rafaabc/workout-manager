import AuthService from '../services/authService.js';
import apiService from '../services/apiService.js';

class Header {
  constructor(container) {
    this.container = container;
  }

  render() {
    const userInfo = AuthService.getUserInfo();
    const headerHTML = `
      <header class="header">
        <div class="header-content">
          <h1 class="header-title">Workout Manager</h1>
          <div class="header-user">
            <span class="username">Welcome, ${userInfo.username}</span>
            <button id="logoutBtn" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>
    `;

    const container = document.getElementById(this.container);
    if (!container) {
      console.error(`Header: container '#${this.container}' not found in DOM`);
      return;
    }
    container.innerHTML = headerHTML;

    // Add event listener for logout
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
  }

  async handleLogout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthService.clearAuth();
      globalThis.location.href = 'index.html?page=login';
    }
  }
}

export default Header;
