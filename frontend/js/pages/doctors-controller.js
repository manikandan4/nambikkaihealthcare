/**
 * Doctors — nurse manages; patient browses profiles (view only).
 */

class DoctorsController {
  constructor() {
    if (!Layout.init('doctors')) return;
    this.doctors = [];
    this.editingId = null;
    this.bindEvents();
    this.setupPage();
    this.load();
  }

  bindEvents() {
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeForm());
    document.getElementById('doctorForm')?.addEventListener('submit', (e) => this.save(e));
    document.getElementById('searchInput')?.addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('resetSearch')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      this.render();
    });
  }

  setupPage() {
    if (Permissions.isPatient()) {
      Layout.setReadOnlyNotice('Browse our doctors — profiles are view only.');
    }
    if (Permissions.canManageDoctors()) {
      Layout.setPageAction('<button class="btn btn-primary btn-sm" id="addBtn"><i class="bi bi-plus-lg me-1"></i>Add</button>');
      document.getElementById('addBtn')?.addEventListener('click', () => this.openForm());
    }
    Layout.show('searchBar');
  }

  async load() {
    try {
      this.doctors = (await ApiService.getDoctors()).data || [];
      this.render();
    } catch (err) {
      Layout.hide('loadingState');
      Layout.show('errorState');
      document.getElementById('errorState').textContent = err.message;
    }
  }

  render(list = this.doctors) {
    Layout.hide('loadingState');
    if (!list.length) {
      const hint = Permissions.isPatient()
        ? 'Doctor profiles will appear here.'
        : 'Add doctors to enable appointments and records.';
      Layout.showEmpty('bi-person-badge', 'No doctors', hint);
      return;
    }
    Layout.show('tableSection'); Layout.hide('emptyState');

    document.getElementById('tableBody').innerHTML = list.map(d => `
      <tr>
        <td>${d.doctor_id}</td>
        <td>Dr. ${d.first_name} ${d.last_name}</td>
        <td>${d.specialty || '—'}</td>
        <td>${Permissions.isPatient() ? '—' : (d.email || '—')}</td>
        <td class="text-end text-nowrap">
          ${Permissions.rowActions({
            view: `doctorsCtrl.view(${d.doctor_id})`,
            edit: Permissions.canManageDoctors() ? `doctorsCtrl.edit(${d.doctor_id})` : null,
            remove: Permissions.canManageDoctors() ? `doctorsCtrl.remove(${d.doctor_id})` : null
          })}
        </td>
      </tr>
    `).join('');
  }

  filter(q) {
    q = q.toLowerCase().trim();
    if (!q) return this.render();
    this.render(this.doctors.filter(d =>
      `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) || (d.specialty || '').toLowerCase().includes(q)
    ));
  }

  openForm(data = {}) {
    this.editingId = data.doctor_id || null;
    document.getElementById('formTitle').textContent = this.editingId ? 'Edit Doctor' : 'Add Doctor';
    document.getElementById('firstName').value = data.first_name || '';
    document.getElementById('lastName').value = data.last_name || '';
    document.getElementById('specialty').value = data.specialty || '';
    document.getElementById('email').value = data.email || '';
    Layout.show('formSection');
  }

  closeForm() {
    this.editingId = null;
    Layout.hide('formSection');
    UIUtils.clearForm(document.getElementById('doctorForm'));
  }

  async view(id) {
    const d = (await ApiService.getDoctor(id)).data;
    UIUtils.showModal('Doctor Profile', `
      <div class="row">
        <div class="col-6">${UIUtils.detailField('Name', `Dr. ${d.first_name} ${d.last_name}`)}</div>
        <div class="col-6">${UIUtils.detailField('Specialty', d.specialty)}</div>
        ${Permissions.isPatient() ? '' : `<div class="col-6">${UIUtils.detailField('Email', d.email)}</div>`}
      </div>
      <button class="btn btn-secondary btn-sm mt-3" onclick="UIUtils.closeModal()">Close</button>`);
  }

  async edit(id) { this.openForm((await ApiService.getDoctor(id)).data); }

  async save(e) {
    e.preventDefault();
    const data = {
      first_name: document.getElementById('firstName').value.trim(),
      last_name: document.getElementById('lastName').value.trim(),
      specialty: document.getElementById('specialty').value.trim(),
      email: document.getElementById('email').value.trim() || null
    };
    try {
      if (this.editingId) await ApiService.updateDoctor(this.editingId, data);
      else await ApiService.createDoctor(data);
      UIUtils.showSuccess('Saved');
      this.closeForm(); this.load();
    } catch (err) { UIUtils.showWarning(err.message); }
  }

  async remove(id) {
    if (!await UIUtils.confirm('Delete this doctor?')) return;
    await ApiService.deleteDoctor(id);
    UIUtils.showSuccess('Deleted');
    this.load();
  }
}

let doctorsCtrl;
document.addEventListener('DOMContentLoaded', () => { doctorsCtrl = new DoctorsController(); });