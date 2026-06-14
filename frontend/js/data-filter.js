/**
 * Scope API data to the logged-in user.
 * Admin sees everything; doctor/patient see only their own rows.
 */

const DataFilter = {
  /** Filter list items that have patient_id and/or doctor_id */
  scope(items) {
    const role = AuthService.getRole();
    const userId = AuthService.getUserId();
    if (!items || role === 'admin' || userId == null) return items || [];

    if (role === 'doctor') {
      return items.filter(item => Number(item.doctor_id) === userId);
    }
    if (role === 'patient') {
      return items.filter(item => Number(item.patient_id) === userId);
    }
    return items;
  },

  /** Single patient record for patient role */
  scopePatient(patient) {
    if (AuthService.getRole() !== 'patient') return patient;
    const userId = AuthService.getUserId();
    return Number(patient.patient_id) === userId ? patient : null;
  },

  scopePatients(patients) {
    if (AuthService.getRole() !== 'patient') return patients;
    const userId = AuthService.getUserId();
    return patients.filter(p => Number(p.patient_id) === userId);
  }
};