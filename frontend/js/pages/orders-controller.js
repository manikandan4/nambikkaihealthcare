/**
 * Clinical Orders — doctor places orders; nurse/patient view only.
 */

class OrdersController {
  constructor() {
    if (!Layout.init('orders')) return;
    this.orders = [];
    this.patients = [];
    this.doctors = [];
    this.editingId = null;
    this.bindEvents();
    this.setupPage();
    this.load();
  }

  bindEvents() {
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeForm());
    document.getElementById('orderForm')?.addEventListener('submit', (e) => this.save(e));
    document.getElementById('searchInput')?.addEventListener('input', (e) => this.filter(e.target.value));
    document.getElementById('resetSearch')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      this.render();
    });
  }

  setupPage() {
    if (Permissions.isNurse()) {
      Layout.setReadOnlyNotice('View only — doctors place clinical orders during consultations.');
    }
    if (Permissions.canCreateOrders()) {
      Layout.setPageAction('<button class="btn btn-primary btn-sm" id="addBtn"><i class="bi bi-plus-lg me-1"></i>New order</button>');
      document.getElementById('addBtn')?.addEventListener('click', () => this.openForm());
    }
    Layout.show('searchBar');
  }

  async load() {
    try {
      const [orders, patients, doctors] = await Promise.all([
        ApiService.getOrders(), ApiService.getPatients(), ApiService.getDoctors()
      ]);
      this.orders = DataFilter.scope(orders.data || []);
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

  render(list = this.orders) {
    Layout.hide('loadingState');
    if (!list.length) {
      Layout.showEmpty('bi-capsule', 'No clinical orders', 'Lab, imaging, and prescription orders appear here.');
      return;
    }
    Layout.show('tableSection'); Layout.hide('emptyState');

    document.getElementById('tableBody').innerHTML = list.map(o => `
      <tr>
        <td>${o.order_id}</td>
        <td>${o.patient_name || '—'}</td>
        <td>${o.doctor_name || '—'}</td>
        <td>${o.order_type || '—'}</td>
        <td>${UIUtils.truncate(o.order_description, 35)}</td>
        <td>${UIUtils.formatDate(o.order_date)}</td>
        <td>${UIUtils.statusBadge(o.status)}</td>
        <td class="text-end text-nowrap">
          ${Permissions.rowActions({
            view: `ordersCtrl.view(${o.order_id})`,
            edit: Permissions.canEditOrders() ? `ordersCtrl.edit(${o.order_id})` : null,
            remove: Permissions.canDeleteOrders() ? `ordersCtrl.remove(${o.order_id})` : null
          })}
        </td>
      </tr>
    `).join('');
  }

  filter(q) {
    q = q.toLowerCase().trim();
    if (!q) return this.render();
    this.render(this.orders.filter(o =>
      (o.patient_name || '').toLowerCase().includes(q) || (o.order_type || '').toLowerCase().includes(q)
    ));
  }

  openForm(data = {}) {
    this.editingId = data.order_id || null;
    document.getElementById('formTitle').textContent = this.editingId ? 'Edit Order' : 'New Clinical Order';
    document.getElementById('patientId').value = data.patient_id || '';
    document.getElementById('orderType').value = data.order_type || '';
    document.getElementById('orderDate').value = data.order_date ? data.order_date.split('T')[0] : new Date().toISOString().split('T')[0];
    document.getElementById('orderDescription').value = data.order_description || '';
    document.getElementById('status').value = data.status || 'Pending';
    document.getElementById('doctorId').value = data.doctor_id || AuthService.getUserId();
    Layout.hide('doctorFieldGroup');
    Layout.show('formSection');
  }

  closeForm() {
    this.editingId = null;
    Layout.hide('formSection');
    UIUtils.clearForm(document.getElementById('orderForm'));
  }

  async view(id) {
    const o = (await ApiService.getOrder(id)).data;
    UIUtils.showModal('Clinical Order', `
      <div class="row">
        <div class="col-6">${UIUtils.detailField('Patient', o.patient_name)}</div>
        <div class="col-6">${UIUtils.detailField('Doctor', o.doctor_name)}</div>
        <div class="col-6">${UIUtils.detailField('Type', o.order_type)}</div>
        <div class="col-6">${UIUtils.detailField('Date', UIUtils.formatDate(o.order_date))}</div>
        <div class="col-12">${UIUtils.detailField('Description', o.order_description)}</div>
      </div>
      <button class="btn btn-secondary btn-sm mt-3" onclick="UIUtils.closeModal()">Close</button>`);
  }

  async edit(id) { this.openForm((await ApiService.getOrder(id)).data); }

  async save(e) {
    e.preventDefault();
    const data = {
      patient_id: parseInt(document.getElementById('patientId').value, 10),
      doctor_id: AuthService.getUserId(),
      order_type: document.getElementById('orderType').value,
      order_description: document.getElementById('orderDescription').value.trim(),
      order_date: document.getElementById('orderDate').value,
      status: document.getElementById('status').value
    };
    try {
      if (this.editingId) await ApiService.updateOrder(this.editingId, data);
      else await ApiService.createOrder(data);
      UIUtils.showSuccess('Order saved');
      this.closeForm(); this.load();
    } catch (err) { UIUtils.showWarning(err.message); }
  }

  async remove(id) {
    if (!await UIUtils.confirm('Delete this order?')) return;
    await ApiService.deleteOrder(id);
    UIUtils.showSuccess('Deleted');
    this.load();
  }
}

let ordersCtrl;
document.addEventListener('DOMContentLoaded', () => { ordersCtrl = new OrdersController(); });