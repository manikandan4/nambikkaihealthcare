/**
 * Patient profile — view-only personal details.
 */

class ProfileController {
  constructor() {
    if (!Layout.init('profile')) return;
    if (!Permissions.isPatient()) {
      window.location.href = 'dashboard.html';
      return;
    }
    this.load();
  }

  async load() {
    try {
      const res = await ApiService.getPatient(AuthService.getUserId());
      const p = res.data;
      Layout.hide('loadingState');
      Layout.show('profileCard');

      document.getElementById('profileContent').innerHTML = `
        <div class="row g-3 row-cols-2 row-cols-md-3">
          <div class="col">${UIUtils.detailField('Full name', `${p.first_name} ${p.last_name}`)}</div>
          <div class="col">${UIUtils.detailField('Patient ID', p.patient_id)}</div>
          <div class="col">${UIUtils.detailField('Date of birth', UIUtils.formatDate(p.date_of_birth))}</div>
          <div class="col">${UIUtils.detailField('Gender', p.gender || '—')}</div>
          <div class="col">${UIUtils.detailField('Phone', p.phone_number || '—')}</div>
          <div class="col">${UIUtils.detailField('Blood group', p.blood_group || '—')}</div>
        </div>
        <div class="alert alert-light border mt-3 mb-0 py-2 px-3 small text-muted">
          <i class="bi bi-info-circle me-1"></i>
          To update details or book an appointment, visit the nurse desk.
        </div>`;
    } catch (err) {
      Layout.hide('loadingState');
      document.getElementById('profileCard').innerHTML =
        `<div class="alert alert-danger">Could not load profile: ${err.message}</div>`;
      Layout.show('profileCard');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new ProfileController());