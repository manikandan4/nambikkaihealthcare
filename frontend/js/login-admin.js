/**
 * Admin login — simple demo credentials (no DB lookup).
 */

const DEMO_ADMIN = { username: 'admin', password: 'admin123' };

document.addEventListener('DOMContentLoaded', () => {
  if (AuthService.isLoggedIn() && AuthService.hasRole('admin')) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const errorEl = document.getElementById('loginError');
    if (username !== DEMO_ADMIN.username || password !== DEMO_ADMIN.password) {
      errorEl.textContent = 'Invalid credentials. Demo: admin / admin123';
      errorEl.classList.remove('d-none');
      return;
    }

    AuthService.login('admin', null, 'Nurse Station');
    window.location.href = 'dashboard.html';
  });
});