/**
 * Compact role-specific dashboards.
 */

class DashboardController {
  constructor() {
    if (!Layout.init('dashboard')) return;
    Layout.setPageAction(
      '<button class="btn btn-outline-secondary btn-sm" id="refreshBtn"><i class="bi bi-arrow-clockwise"></i></button>'
    );
    document.getElementById('refreshBtn')?.addEventListener('click', () => this.load());
    this.load();
  }

  toolbar(hint, actions = '') {
    if (!hint && actions) {
      return `<div class="d-flex justify-content-end gap-2 mb-3">${actions}</div>`;
    }
    return `<div class="card border mb-3">
      <div class="card-body py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        ${hint ? `<span class="text-muted small">${hint}</span>` : ''}
        ${actions ? `<div class="d-flex flex-wrap gap-2">${actions}</div>` : ''}
      </div>
    </div>`;
  }

  stat(value, label) {
    return `<div class="dashboard-stat card border h-100">
      <div class="card-body py-2 px-3">
        <div class="stat-value mb-1">${value}</div>
        <div class="stat-label text-truncate">${label}</div>
      </div>
    </div>`;
  }

  statRow(items) {
    return `<div class="dashboard-stats mb-3">${items.map(([v, l]) => this.stat(v, l)).join('')}</div>`;
  }

  table(title, rows, cols) {
    if (!rows.length) {
      return `<div class="card border">
        <div class="card-header py-2 small fw-medium bg-white border-bottom">${title}</div>
        <div class="card-body py-3 text-muted small">No items yet.</div>
      </div>`;
    }
    const head = cols.map(c => `<th class="fw-medium">${c.label}</th>`).join('');
    const body = rows.slice(0, 8).map(r =>
      `<tr>${cols.map(c => `<td>${c.cell(r)}</td>`).join('')}</tr>`
    ).join('');
    return `<div class="card border">
      <div class="card-header py-2 small fw-medium bg-white border-bottom d-flex justify-content-between">
        <span>${title}</span><span class="text-muted fw-normal">${rows.length}</span>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light"><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
  }

  render(content) {
    document.getElementById('dashboardContent').innerHTML = content;
  }

  async load() {
    const el = document.getElementById('dashboardContent');
    el.innerHTML = '<div class="text-muted small py-2">Loading…</div>';
    try {
      if (Permissions.isNurse()) await this.nurse();
      else if (Permissions.isDoctor()) await this.doctor();
      else await this.patient();
    } catch (err) {
      el.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${err.message}</div>`;
    }
  }

  async nurse() {
    const [patients, appointments, doctors] = await Promise.all([
      ApiService.getPatients(), ApiService.getAppointments(), ApiService.getDoctors()
    ]);
    const apts = appointments.data || [];
    const queue = apts.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed');

    this.render(`
      ${this.toolbar('', `
        <a href="patients.html" class="btn btn-primary btn-sm">Register</a>
        <a href="appointments.html" class="btn btn-outline-primary btn-sm">Schedule</a>
      `)}
      ${this.statRow([
        [(patients.data || []).length, 'Patients'],
        [queue.length, 'Upcoming'],
        [(doctors.data || []).length, 'Doctors'],
        [apts.length, 'Appointments']
      ])}
      ${this.table('Appointment queue', queue, [
        { label: 'Patient', cell: r => r.patient_name },
        { label: 'Doctor', cell: r => r.doctor_name },
        { label: 'When', cell: r => UIUtils.formatDateTime(r.appointment_datetime) },
        { label: 'Status', cell: r => UIUtils.statusBadge(r.status) }
      ])}`);
  }

  async doctor() {
    const [appointments, records] = await Promise.all([
      ApiService.getAppointments(), ApiService.getRecords()
    ]);
    const myApts = DataFilter.scope(appointments.data || []);
    const myRecords = DataFilter.scope(records.data || []);
    const specialty = AuthService.getProfile().specialty || 'Physician';

    this.render(`
      ${this.toolbar(`${specialty} — record diagnosis after each consultation`, `
        <a href="medical-records.html?new=1" class="btn btn-primary btn-sm">Record</a>
        <a href="clinical-orders.html" class="btn btn-outline-secondary btn-sm">Order</a>
      `)}
      ${this.statRow([
        [myApts.length, 'Appointments'],
        [myRecords.length, 'Records']
      ])}
      ${this.table('Today\'s schedule', myApts, [
        { label: 'Patient', cell: r => r.patient_name },
        { label: 'When', cell: r => UIUtils.formatDateTime(r.appointment_datetime) },
        { label: 'Reason', cell: r => UIUtils.truncate(r.reason_for_visit, 28) },
        { label: 'Status', cell: r => UIUtils.statusBadge(r.status) }
      ])}`);
  }

  async patient() {
    const myApts = DataFilter.scope((await ApiService.getAppointments()).data || []);
    const p = AuthService.getProfile();

    this.render(`
      ${this.toolbar('Read-only — visit the nurse desk to book or update appointments')}
      ${this.statRow([
        [myApts.length, 'Appointments'],
        [p.blood_group || '—', 'Blood group']
      ])}
      ${this.table('Appointments', myApts, [
        { label: 'Doctor', cell: r => r.doctor_name },
        { label: 'Specialty', cell: r => r.specialty || '—' },
        { label: 'When', cell: r => UIUtils.formatDateTime(r.appointment_datetime) },
        { label: 'Status', cell: r => UIUtils.statusBadge(r.status) }
      ])}`);
  }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());