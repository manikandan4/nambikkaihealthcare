/**
 * Portal landing page — routes to role-specific login screens.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (AuthService.isLoggedIn() && AuthService.hasIdentity()) {
    window.location.href = 'dashboard.html';
    return;
  }

  checkApi(document.getElementById('apiStatus'));
});

async function checkApi(el) {
  if (!el) return;
  try {
    const res = await fetch('http://localhost:3000/health');
    el.textContent = res.ok ? 'API: Connected' : 'API: Offline';
    el.classList.toggle('connected', res.ok);
    el.classList.toggle('offline', !res.ok);
  } catch {
    el.textContent = 'API: Offline — start server on port 3000';
    el.classList.add('offline');
  }
}