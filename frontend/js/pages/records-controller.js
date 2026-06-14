/**
 * Medical Records — doctor records diagnosis; nurse/patient view only.
 */

class RecordsController {
  constructor() {
    if (!Layout.init('records')) return;
    this.records = [];
    this.patients = [];
    this.doctors = [];
    this.editingId = null;
    this.bindEvents();
    this.setupPage();
    this.load();
    if (new URLSearchParams(location.search).get('new') === '1' && Permissions.canCreateRecords()) {
      this.openForm();
    }
  }

  bindEvents() {
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeForm());
    document.getElementById('recordForm')?.addEventListener('submit', (e) => this.save(e));
    document.getElementById('searchInput')?.addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('resetSearch')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      this.render();
    });
  }

  setupPage() {
    if (Permissions.isReadOnly()) {
      Layout.setReadOnlyNotice('View only — your visit history and diagnoses.');
    } else if (Permissions.isNurse()) {
      Layout.setReadOnlyNotice('View only — doctors record diagnoses after consultations.');
    }
    if (Permissions.canCreateRecords()) {
      Layout.setPageAction('<button class="btn btn-primary btn-sm" id="addBtn"><i class="bi bi-journal-plus me-1"></i>Record</button>');
      document.getElementById('addBtn')?.addEventListener('click', () => this.openForm());
    }
    Layout.show('searchBar');
  }

  async load() {
    try {
      const [records, patients, doctors] = await Promise.all([
        ApiService.getRecords(), ApiService.getPatients(), ApiService.getDoctors()
      ]);
      this.records = DataFilter.scope(records.data || []);
      this.patients = patients.data || [];
      this.doctors = doctors.data || [];
      this.fillSelects();
      this.render();
    } catch (err) {
      Layout.hide('loadingState');
      Layout.show('errorState');
      document.getElementById('errorState').textContent = err.message;
    }
  }

  fillSelects() {
    document.getElementById('patientId').innerHTML = '<option value="">Select patient</option>' +
      this.patients.map(p => `<option value="${p.patient_id}">${p.first_name} ${p.last_name}</option>`).join('');
    document.getElementById('doctorId').innerHTML = '<option value="">Select doctor</option>' +
      this.doctors.map(d => `<option value="${d.doctor_id}">Dr. ${d.first_name} ${d.last_name}</option>`).join('');
  }

  render(list = this.records) {
    Layout.hide('loadingState');
    if (!list.length) {
      const hint = Permissions.isPatient()
        ? 'Your visit records will appear here after consultations.'
        : 'Clinical visit records will appear here.';
      Layout.showEmpty('bi-journal-medical', 'No medical records', hint);
      return;
    }
    Layout.show('tableSection'); Layout.hide('emptyState');

    document.getElementById('tableBody').innerHTML = list.map(r => `
      <tr>
        <td>${r.record_id}</td>
        <td>${r.patient_name || '—'}</td>
        <td>${r.doctor_name || '—'}</td>
        <td>${UIUtils.formatDate(r.visit_date)}</td>
        <td>${UIUtils.truncate(r.diagnosis, 35)}</td>
        <td class="text-end text-nowrap">
          ${Permissions.rowActions({
            view: `recordsCtrl.view(${r.record_id})`,
            edit: Permissions.canEditRecords() ? `recordsCtrl.edit(${r.record_id})` : null,
            remove: Permissions.canDeleteRecords() ? `recordsCtrl.remove(${r.record_id})` : null
          })}
        </td>
      </tr>
    `).join('');
  }

  filter(q) {
    q = q.toLowerCase().trim();
    if (!q) return this.render();
    this.render(this.records.filter(r =>
      (r.patient_name || '').toLowerCase().includes(q) || (r.diagnosis || '').toLowerCase().includes(q)
    ));
  }

  openForm(data = {}) {
    this.editingId = data.record_id || null;
    document.getElementById('formTitle').textContent = this.editingId ? 'Edit Record' : 'Record Diagnosis';
    document.getElementById('submitBtn').textContent = this.editingId ? 'Update' : 'Save';
    document.getElementById('patientId').value = data.patient_id || '';
    document.getElementById('visitDate').value = data.visit_date ? data.visit_date.split('T')[0] : new Date().toISOString().split('T')[0];
    document.getElementById('symptoms').value = data.symptoms || '';
    document.getElementById('diagnosis').value = data.diagnosis || '';
    document.getElementById('notes').value = data.notes || '';
    document.getElementById('doctorId').value = data.doctor_id || AuthService.getUserId();
    Layout.hide('doctorFieldGroup');
    Layout.show('formSection');
  }

  closeForm() {
    this.editingId = null;
    Layout.hide('formSection');
    UIUtils.clearForm(document.getElementById('recordForm'));
  }

  async view(id) {
    const r = (await ApiService.getRecord(id)).data;
    UIUtils.showModal('Medical Record', `
      <div class="row">
        <div class="col-6">${UIUtils.detailField('Patient', r.patient_name)}</div>
        <div class="col-6">${UIUtils.detailField('Doctor', r.doctor_name)}</div>
        <div class="col-6">${UIUtils.detailField('Visit Date', UIUtils.formatDate(r.visit_date))}</div>
        <div class="col-12">${UIUtils.detailField('Symptoms', r.symptoms)}</div>
        <div class="col-12">${UIUtils.detailField('Diagnosis', r.diagnosis)}</div>
        <div class="col-12">${UIUtils.detailField('Notes', r.notes)}</div>
      </div>
      <button class="btn btn-secondary btn-sm mt-3" onclick="UIUtils.closeModal()">Close</button>`);
  }

  async edit(id) { this.openForm((await ApiService.getRecord(id)).data); }

  async save(e) {
    e.preventDefault();
    const data = {
      patient_id: parseInt(document.getElementById('patientId').value, 10),
      doctor_id: AuthService.getUserId(),
      visit_date: document.getElementById('visitDate').value,
      symptoms: document.getElementById('symptoms').value.trim() || null,
      diagnosis: document.getElementById('diagnosis').value.trim(),
      notes: document.getElementById('notes').value.trim() || null
    };
    try {
      if (this.editingId) await ApiService.updateRecord(this.editingId, data);
      else await ApiService.createRecord(data);
      UIUtils.showSuccess('Diagnosis saved');
      this.closeForm(); this.load();
    } catch (err) { UIUtils.showWarning(err.message); }
  }

  async remove(id) {
    if (!await UIUtils.confirm('Delete this record?')) return;
    await ApiService.deleteRecord(id);
    UIUtils.showSuccess('Deleted');
    this.load();
  }
}

let recordsCtrl;
document.addEventListener('DOMContentLoaded', () => { recordsCtrl = new RecordsController(); });