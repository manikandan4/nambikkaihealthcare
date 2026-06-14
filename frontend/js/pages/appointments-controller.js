/**
 * Appointments — nurse schedules; doctor & patient view their own (read-only).
 */

class AppointmentsController {
  constructor() {
    if (!Layout.init('appointments')) return;
    this.appointments = [];
    this.patients = [];
    this.doctors = [];
    this.editingId = null;
    this.bindEvents();
    this.setupPage();
    this.load();
  }

  bindEvents() {
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeForm());
    document.getElementById('appointmentForm')?.addEventListener('submit', (e) => this.save(e));
    document.getElementById('searchInput')?.addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('resetSearch')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      this.render();
    });
  }

  setupPage() {
    if (Permissions.isReadOnly()) {
      Layout.setReadOnlyNotice('View only — appointments are scheduled at the nurse desk.');
    }
    if (Permissions.canScheduleAppointments()) {
      Layout.setPageAction('<button class="btn btn-primary btn-sm" id="addBtn"><i class="bi bi-calendar-plus me-1"></i>Schedule</button>');
      document.getElementById('addBtn')?.addEventListener('click', () => this.openForm());
    }
    Layout.show('searchBar');
    this.emptyHint = Permissions.isReadOnly()
      ? 'Visit the nurse desk to book an appointment.'
      : 'Schedule an appointment to get started.';
  }

  async load() {
    try {
      const [apts, patients, doctors] = await Promise.all([
        ApiService.getAppointments(), ApiService.getPatients(), ApiService.getDoctors()
      ]);
      this.appointments = DataFilter.scope(apts.data || []);
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
      this.doctors.map(d => `<option value="${d.doctor_id}">Dr. ${d.first_name} ${d.last_name} (${d.specialty})</option>`).join('');
  }

  render(list = this.appointments) {
    Layout.hide('loadingState');
    if (!list.length) {
      Layout.showEmpty('bi-calendar-check', 'No appointments', this.emptyHint);
      return;
    }
    Layout.show('tableSection'); Layout.hide('emptyState');

    document.getElementById('tableBody').innerHTML = list.map(a => `
      <tr>
        <td>${a.appointment_id}</td>
        <td>${a.patient_name || '—'}</td>
        <td>${a.doctor_name || '—'}</td>
        <td>${UIUtils.formatDateTime(a.appointment_datetime)}</td>
        <td>${UIUtils.statusBadge(a.status)}</td>
        <td class="text-end text-nowrap">
          ${Permissions.rowActions({
            view: `appointmentsCtrl.view(${a.appointment_id})`,
            edit: Permissions.canScheduleAppointments() ? `appointmentsCtrl.edit(${a.appointment_id})` : null,
            remove: Permissions.canScheduleAppointments() ? `appointmentsCtrl.remove(${a.appointment_id})` : null
          })}
        </td>
      </tr>
    `).join('');
  }

  filter(q) {
    q = q.toLowerCase().trim();
    if (!q) return this.render();
    this.render(this.appointments.filter(a =>
      (a.patient_name || '').toLowerCase().includes(q) || (a.doctor_name || '').toLowerCase().includes(q)
    ));
  }

  openForm(data = {}) {
    this.editingId = data.appointment_id || null;
    document.getElementById('formTitle').textContent = this.editingId ? 'Edit Appointment' : 'Schedule Appointment';
    document.getElementById('submitBtn').textContent = this.editingId ? 'Update' : 'Schedule';
    document.getElementById('patientId').value = data.patient_id || '';
    document.getElementById('doctorId').value = data.doctor_id || '';
    const dt = UIUtils.splitDateTime(data.appointment_datetime);
    document.getElementById('appointmentDate').value = dt.date;
    document.getElementById('appointmentTime').value = dt.time;
    document.getElementById('status').value = data.status || 'Scheduled';
    document.getElementById('reasonForVisit').value = data.reason_for_visit || '';
    Layout.show('formSection');
  }

  closeForm() {
    this.editingId = null;
    Layout.hide('formSection');
    UIUtils.clearForm(document.getElementById('appointmentForm'));
  }

  async view(id) {
    const res = await ApiService.getAppointment(id);
    const a = res.data;
    UIUtils.showModal('Appointment Details', `
      <div class="row">
        <div class="col-6">${UIUtils.detailField('Patient', a.patient_name)}</div>
        <div class="col-6">${UIUtils.detailField('Doctor', a.doctor_name)}</div>
        <div class="col-6">${UIUtils.detailField('Date & Time', UIUtils.formatDateTime(a.appointment_datetime))}</div>
        <div class="col-6">${UIUtils.detailField('Status', a.status)}</div>
        <div class="col-12">${UIUtils.detailField('Reason', a.reason_for_visit)}</div>
      </div>
      <button class="btn btn-secondary btn-sm mt-3" onclick="UIUtils.closeModal()">Close</button>`);
  }

  async edit(id) {
    this.openForm((await ApiService.getAppointment(id)).data);
  }

  async save(e) {
    e.preventDefault();
    const data = {
      patient_id: parseInt(document.getElementById('patientId').value, 10),
      doctor_id: parseInt(document.getElementById('doctorId').value, 10),
      appointment_datetime: UIUtils.combineDateTime(
        document.getElementById('appointmentDate').value,
        document.getElementById('appointmentTime').value
      ),
      status: document.getElementById('status').value,
      reason_for_visit: document.getElementById('reasonForVisit').value.trim() || null
    };
    try {
      if (this.editingId) await ApiService.updateAppointment(this.editingId, data);
      else await ApiService.createAppointment(data);
      UIUtils.showSuccess(this.editingId ? 'Updated' : 'Scheduled');
      this.closeForm(); this.load();
    } catch (err) { UIUtils.showWarning(err.message); }
  }

  async remove(id) {
    if (!await UIUtils.confirm('Cancel/delete this appointment?')) return;
    await ApiService.deleteAppointment(id);
    UIUtils.showSuccess('Removed');
    this.load();
  }
}

let appointmentsCtrl;
document.addEventListener('DOMContentLoaded', () => { appointmentsCtrl = new AppointmentsController(); });