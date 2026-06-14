/**
 * Shared UI helpers used across all pages.
 */

const UIUtils = {
  /**
   * Normalize any date value to YYYY-MM-DD using local calendar date.
   * Avoids UTC timezone shifts (e.g. 24 Jan 1973 stored as 1973-01-23T18:30:00Z).
   */
  toInputDate(value) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatDate(value) {
    if (!value) return '—';
    const inputDate = UIUtils.toInputDate(value);
    if (inputDate) {
      const [y, m, d] = inputDate.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
    return String(value);
  },

  formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  splitDateTime(datetime) {
    if (!datetime) return { date: '', time: '' };
    const d = new Date(datetime);
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().slice(0, 5);
    return { date, time };
  },

  combineDateTime(date, time) {
    return `${date}T${time}:00`;
  },

  truncate(text, max = 40) {
    if (!text) return '—';
    return text.length > max ? text.slice(0, max) + '…' : text;
  },

  statusBadge(status) {
    const s = (status || 'pending').toLowerCase().replace(/\s+/g, '-');
    const map = {
      scheduled: 'primary', confirmed: 'info', completed: 'success',
      cancelled: 'danger', pending: 'warning', 'in-progress': 'info'
    };
    const color = map[s] || 'secondary';
    return `<span class="badge text-bg-${color} fw-normal">${status || 'Pending'}</span>`;
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const bg = type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-warning';
    const id = 'toast-' + Date.now();

    container.insertAdjacentHTML('beforeend', `
      <div id="${id}" class="toast app-toast ${bg}" role="alert">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `);

    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  },

  showSuccess(msg) { this.showToast(msg, 'success'); },
  showError(msg) { this.showToast(msg, 'error'); },
  showWarning(msg) { this.showToast(msg, 'warning'); },

  async confirm(message) {
    return window.confirm(message);
  },

  clearForm(form) {
    if (form) form.reset();
  },

  showModal(title, bodyHtml) {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="app-modal-backdrop" id="appModal">
        <div class="app-modal">
          <div class="app-modal-header">
            <h6 class="mb-0 fw-semibold">${title}</h6>
            <button type="button" class="btn-close" onclick="UIUtils.closeModal()"></button>
          </div>
          <div class="app-modal-body">${bodyHtml}</div>
        </div>
      </div>
    `;

    document.getElementById('appModal').addEventListener('click', (e) => {
      if (e.target.id === 'appModal') this.closeModal();
    });
  },

  closeModal() {
    const container = document.getElementById('modalContainer');
    if (container) container.innerHTML = '';
  },

  detailField(label, value) {
    return `<div class="mb-2"><div class="text-muted small">${label}</div><div>${value ?? '—'}</div></div>`;
  },

  emptyState(icon, title, hint = '') {
    return `<div class="text-center text-muted py-4">
      <i class="bi ${icon} opacity-25 fs-4 d-block mb-2"></i>
      <div class="small fw-medium">${title}</div>
      ${hint ? `<div class="small mt-1">${hint}</div>` : ''}
    </div>`;
  }
};