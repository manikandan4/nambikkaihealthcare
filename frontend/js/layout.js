/**
 * Shared layout: nav, auth guard, page titles, footer status.
 */

const Layout = {
  NAV: {
    admin: [
      { id: 'dashboard', label: 'Station', href: 'dashboard.html', icon: 'bi-speedometer2' },
      { id: 'patients', label: 'Patients', href: 'patients.html', icon: 'bi-people' },
      { id: 'appointments', label: 'Appointments', href: 'appointments.html', icon: 'bi-calendar-check' },
      { id: 'doctors', label: 'Doctors', href: 'doctors.html', icon: 'bi-person-badge' },
      { id: 'records', label: 'Records', href: 'medical-records.html', icon: 'bi-journal-medical' },
      { id: 'orders', label: 'Orders', href: 'clinical-orders.html', icon: 'bi-capsule' }
    ],
    doctor: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'bi-speedometer2' },
      { id: 'appointments', label: 'Schedule', href: 'appointments.html', icon: 'bi-calendar-check' },
      { id: 'records', label: 'Diagnosis', href: 'medical-records.html', icon: 'bi-journal-medical' },
      { id: 'orders', label: 'Orders', href: 'clinical-orders.html', icon: 'bi-capsule' }
    ],
    patient: [
      { id: 'dashboard', label: 'Home', href: 'dashboard.html', icon: 'bi-house' },
      { id: 'profile', label: 'Profile', href: 'profile.html', icon: 'bi-person' },
      { id: 'appointments', label: 'Appointments', href: 'appointments.html', icon: 'bi-calendar-check' },
      { id: 'doctors', label: 'Doctors', href: 'doctors.html', icon: 'bi-person-badge' },
      { id: 'records', label: 'Records', href: 'medical-records.html', icon: 'bi-journal-medical' }
    ]
  },

  /** Role-aware page titles shown in the header band */
  PAGE: {
    dashboard: {
      admin: { title: 'Nurse Station', subtitle: 'Register patients and manage the appointment queue' },
      doctor: { title: 'Dashboard', subtitle: 'Your schedule and clinical work' },
      patient: { title: 'Home', subtitle: 'View your health information (read only)' }
    },
    patients: {
      admin: { title: 'Patients', subtitle: 'Register and update patient records' }
    },
    appointments: {
      admin: { title: 'Appointments', subtitle: 'Schedule and manage patient visits' },
      doctor: { title: 'My Schedule', subtitle: 'Appointments assigned to you' },
      patient: { title: 'Appointments', subtitle: 'Scheduled by the nurse desk — view only' }
    },
    doctors: {
      admin: { title: 'Doctors', subtitle: 'Manage physician profiles' },
      patient: { title: 'Our Doctors', subtitle: 'Browse doctor profiles' }
    },
    records: {
      admin: { title: 'Medical Records', subtitle: 'All visit records and diagnoses' },
      doctor: { title: 'Diagnosis & Records', subtitle: 'Record symptoms and diagnosis after consultations' },
      patient: { title: 'My Records', subtitle: 'Your visit history and diagnoses' }
    },
    orders: {
      admin: { title: 'Clinical Orders', subtitle: 'Lab tests, imaging, and prescriptions' },
      doctor: { title: 'Clinical Orders', subtitle: 'Orders you have placed' }
    },
    profile: {
      patient: { title: 'My Profile', subtitle: 'Personal details on file' }
    }
  },

  init(activePage) {
    if (!AuthService.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    if (!AuthService.hasIdentity()) {
      window.location.href = AuthService.loginPageForRole(AuthService.getRole());
      return false;
    }
    if (!Permissions.canAccessPage(activePage)) {
      window.location.href = 'dashboard.html';
      return false;
    }

    this.setPageHeader(activePage);
    this.renderNav(activePage);
    this.renderUserBadge();
    this.bindLogout();
    this.checkApiStatus();
    return true;
  },

  setPageHeader(pageId) {
    const role = AuthService.getRole();
    const meta = this.PAGE[pageId]?.[role] || this.PAGE[pageId]?.admin || this.PAGE[pageId]?.patient;
    const titleEl = document.querySelector('.page-title');
    const subEl = document.querySelector('.page-subtitle');
    if (meta && titleEl) titleEl.textContent = meta.title;
    if (meta && subEl) subEl.textContent = meta.subtitle;
  },

  renderNav(activePage) {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    const items = this.NAV[AuthService.getRole()] || this.NAV.patient;
    nav.innerHTML = items.map(item => `
      <li class="nav-item">
        <a class="nav-link ${item.id === activePage ? 'active' : ''}" href="${item.href}">
          <i class="bi ${item.icon} me-1"></i>${item.label}
        </a>
      </li>
    `).join('');
  },

  renderUserBadge() {
    const badge = document.getElementById('userBadge');
    if (!badge) return;
    badge.innerHTML = `${AuthService.getDisplayName()} <span class="badge bg-light text-dark ms-1 fw-normal">${Permissions.roleLabel()}</span>`;
  },

  bindLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      AuthService.logout();
      window.location.href = 'index.html';
    });
  },

  async checkApiStatus() {
    const el = document.getElementById('apiStatus');
    if (!el) return;
    try {
      const ok = (await fetch('http://localhost:3000/health')).ok;
      el.textContent = ok ? 'Live' : 'Offline';
      el.className = ok ? 'text-success' : 'text-danger';
    } catch {
      el.textContent = 'Offline';
      el.className = 'text-danger';
    }
  },

  show(id) { document.getElementById(id)?.classList.remove('d-none'); },
  hide(id) { document.getElementById(id)?.classList.add('d-none'); },

  setPageAction(html) {
    const el = document.getElementById('pageActions');
    if (el) el.innerHTML = html;
  },

  setReadOnlyNotice(message) {
    const el = document.getElementById('readOnlyNotice');
    if (!el) return;
    el.innerHTML = `<i class="bi bi-eye me-1"></i>${message}`;
    el.className = 'alert alert-light border py-2 px-3 mb-3 small text-muted';
    el.classList.remove('d-none');
  },

  showEmpty(icon, title, hint = '', extraHtml = '') {
    const el = document.getElementById('emptyState');
    if (el) el.innerHTML = UIUtils.emptyState(icon, title, hint) + extraHtml;
    this.hide('tableSection');
    this.show('emptyState');
  }
};