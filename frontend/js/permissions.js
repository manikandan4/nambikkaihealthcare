/**
 * Role permissions — single source of truth for what each role can do.
 *
 * Nurse (admin): front desk — register patients, schedule appointments, oversee records
 * Doctor: clinical — view schedule, write diagnosis (records), place orders
 * Patient: read-only portal — own data only; appointments booked at hospital
 */

const Permissions = {
  role: () => AuthService.getRole(),

  roleLabel: () => ({ admin: 'Nurse', doctor: 'Doctor', patient: 'Patient' }[Permissions.role()] || ''),

  isNurse: () => Permissions.role() === 'admin',
  isDoctor: () => Permissions.role() === 'doctor',
  isPatient: () => Permissions.role() === 'patient',

  /** Patient portal is entirely view-only */
  isReadOnly: () => Permissions.isPatient(),

  canManagePatients: () => Permissions.isNurse(),
  canManageDoctors: () => Permissions.isNurse(),
  canScheduleAppointments: () => Permissions.isNurse(),

  canCreateRecords: () => Permissions.isDoctor(),
  canEditRecords: () => Permissions.isDoctor(),
  canDeleteRecords: () => Permissions.isNurse(),

  canCreateOrders: () => Permissions.isDoctor(),
  canEditOrders: () => Permissions.isDoctor(),
  canDeleteOrders: () => Permissions.isNurse(),

  /** Pages each role may access (used to block direct URL access) */
  allowedPages: {
    admin: ['dashboard', 'patients', 'doctors', 'appointments', 'records', 'orders'],
    doctor: ['dashboard', 'appointments', 'records', 'orders'],
    patient: ['dashboard', 'profile', 'appointments', 'doctors', 'records']
  },

  canAccessPage(pageId) {
    const allowed = Permissions.allowedPages[Permissions.role()] || [];
    return allowed.includes(pageId);
  },

  /** Build action buttons for a table row */
  rowActions({ view, edit, remove }) {
    if (Permissions.isReadOnly()) {
      return view ? `<button class="btn btn-outline-primary btn-sm" onclick="${view}">View</button>` : '';
    }
    let html = view ? `<button class="btn btn-outline-primary btn-sm" onclick="${view}">View</button> ` : '';
    if (edit) html += `<button class="btn btn-outline-secondary btn-sm" onclick="${edit}">Edit</button> `;
    if (remove) html += `<button class="btn btn-outline-danger btn-sm" onclick="${remove}">Delete</button>`;
    return html;
  }
};