/**
 * Patient login — select your name and verify with date of birth.
 */

let patients = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (AuthService.isLoggedIn() && AuthService.hasRole('patient') && AuthService.hasIdentity()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const select = document.getElementById('patientId');
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');

  try {
    const res = await ApiService.getPatients();
    patients = res.data || [];

    if (!patients.length) {
      select.innerHTML = '<option value="">No patients in system — register as admin first</option>';
      select.disabled = true;
      return;
    }

    select.innerHTML = '<option value="">Select your name</option>' +
      patients.map(p =>
        `<option value="${p.patient_id}">${p.first_name} ${p.last_name}</option>`
      ).join('');
  } catch (err) {
    errorEl.textContent = 'Could not load patients: ' + err.message;
    errorEl.classList.remove('d-none');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');

    const patientId = parseInt(select.value, 10);
    const dob = document.getElementById('dateOfBirth').value;
    const patient = patients.find(p => p.patient_id === patientId);

    if (!patient) {
      errorEl.textContent = 'Please select your name from the list.';
      errorEl.classList.remove('d-none');
      return;
    }

    const storedDob = UIUtils.toInputDate(patient.date_of_birth);
    if (dob !== storedDob) {
      errorEl.textContent = 'Date of birth does not match our records.';
      errorEl.classList.remove('d-none');
      return;
    }

    AuthService.login(
      'patient',
      patient.patient_id,
      `${patient.first_name} ${patient.last_name}`,
      { date_of_birth: storedDob, blood_group: patient.blood_group }
    );
    window.location.href = 'dashboard.html';
  });
});