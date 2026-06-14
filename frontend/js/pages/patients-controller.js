/**
 * Patients — nurse registers and manages patient records.
 */

class PatientsController {
  constructor() {
    if (!Layout.init('patients')) return;
    if (!Permissions.canManagePatients()) {
      window.location.href = 'dashboard.html';
      return;
    }
    this.patients = [];
    this.editingId = null;
    this.bindEvents();
    Layout.setPageAction('<button class="btn btn-primary btn-sm" id="addBtn"><i class="bi bi-person-plus me-1"></i>Register</button>');
    document.getElementById('addBtn')?.addEventListener('click', () => this.openForm());
    Layout.show('searchBar');
    this.load();
  }

  bindEvents() {
    document.getElementById('emptyState')?.addEventListener('click', (e) => {
      if (e.target.id === 'emptyAddBtn') this.openForm();
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeForm());
    document.getElementById('patientForm')?.addEventListener('submit', (e) => this.save(e));
    document.getElementById('searchInput')?.addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('resetSearch')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      this.render();
    });
  }

  async load() {
    try {
      this.patients = (await ApiService.getPatients()).data || [];
      this.render();
    } catch (err) {
      Layout.hide('loadingState');
      Layout.show('errorState');
      document.getElementById('errorState').textContent = err.message;
    }
  }

  render(list = this.patients) {
    Layout.hide('loadingState');
    if (!list.length) {
      Layout.showEmpty('bi-people', 'No patients yet', 'Register your first patient to get started.',
        '<div class="text-center pb-3"><button class="btn btn-primary btn-sm" id="emptyAddBtn">Register patient</button></div>');
      return;
    }
    Layout.show('tableSection'); Layout.hide('emptyState');

    document.getElementById('tableBody').innerHTML = list.map(p => `
      <tr>
        <td>${p.patient_id}</td>
        <td>${p.first_name} ${p.last_name}</td>
        <td>${UIUtils.formatDate(p.date_of_birth)}</td>
        <td>${p.gender || '—'}</td>
        <td>${p.phone_number || '—'}</td>
        <td>${p.blood_group || '—'}</td>
        <td class="text-end text-nowrap">
          ${Permissions.rowActions({
            view: `patientsCtrl.view(${p.patient_id})`,
            edit: `patientsCtrl.edit(${p.patient_id})`,
            remove: `patientsCtrl.remove(${p.patient_id})`
          })}
        </td>
      </tr>
    `).join('');
  }

  filter(q) {
    q = q.toLowerCase().trim();
    if (!q) return this.render();
    this.render(this.patients.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || (p.phone_number || '').includes(q)
    ));
  }

  openForm(data = {}) {
    this.editingId = data.patient_id || null;
    document.getElementById('formTitle').textContent = this.editingId ? 'Edit Patient' : 'Register Patient';
    document.getElementById('firstName').value = data.first_name || '';
    document.getElementById('lastName').value = data.last_name || '';
    document.getElementById('dateOfBirth').value = UIUtils.toInputDate(data.date_of_birth);
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('phoneNumber').value = data.phone_number || '';
    document.getElementById('bloodGroup').value = data.blood_group || '';
    Layout.show('formSection');
  }

  closeForm() {
    this.editingId = null;
    Layout.hide('formSection');
    UIUtils.clearForm(document.getElementById('patientForm'));
  }

  async view(id) {
    const p = (await ApiService.getPatient(id)).data;
    UIUtils.showModal('Patient Details', `
      <div class="row">
        <div class="col-6">${UIUtils.detailField('Name', `${p.first_name} ${p.last_name}`)}</div>
        <div class="col-6">${UIUtils.detailField('DOB', UIUtils.formatDate(p.date_of_birth))}</div>
        <div class="col-6">${UIUtils.detailField('Gender', p.gender)}</div>
        <div class="col-6">${UIUtils.detailField('Phone', p.phone_number)}</div>
        <div class="col-6">${UIUtils.detailField('Blood Group', p.blood_group)}</div>
      </div>
      <button class="btn btn-secondary btn-sm mt-3" onclick="UIUtils.closeModal()">Close</button>`);
  }

  async edit(id) { this.openForm((await ApiService.getPatient(id)).data); }

  async save(e) {
    e.preventDefault();
    const data = {
      first_name: document.getElementById('firstName').value.trim(),
      last_name: document.getElementById('lastName').value.trim(),
      date_of_birth: document.getElementById('dateOfBirth').value,
      gender: document.getElementById('gender').value,
      phone_number: document.getElementById('phoneNumber').value.trim() || null,
      blood_group: document.getElementById('bloodGroup').value || null
    };
    try {
      if (this.editingId) await ApiService.updatePatient(this.editingId, data);
      else await ApiService.createPatient(data);
      UIUtils.showSuccess('Saved');
      this.closeForm(); this.load();
    } catch (err) { UIUtils.showWarning(err.message); }
  }

  async remove(id) {
    if (!await UIUtils.confirm('Delete this patient?')) return;
    await ApiService.deletePatient(id);
    UIUtils.showSuccess('Deleted');
    this.load();
  }
}

let patientsCtrl;
document.addEventListener('DOMContentLoaded', () => { patientsCtrl = new PatientsController(); });