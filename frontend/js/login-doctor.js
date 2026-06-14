/**
 * Doctor login — select a doctor and verify with their registered email.
 * Teaches identity-based access without a full auth server.
 */

let doctors = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (AuthService.isLoggedIn() && AuthService.hasRole('doctor') && AuthService.hasIdentity()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const select = document.getElementById('doctorId');
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');

  try {
    const res = await ApiService.getDoctors();
    doctors = res.data || [];

    if (!doctors.length) {
      select.innerHTML = '<option value="">No doctors in system — add one as admin first</option>';
      select.disabled = true;
      return;
    }

    select.innerHTML = '<option value="">Select your name</option>' +
      doctors.map(d =>
        `<option value="${d.doctor_id}">Dr. ${d.first_name} ${d.last_name} — ${d.specialty || 'General'}</option>`
      ).join('');
  } catch (err) {
    errorEl.textContent = 'Could not load doctors: ' + err.message;
    errorEl.classList.remove('d-none');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');

    const doctorId = parseInt(select.value, 10);
    const email = document.getElementById('email').value.trim().toLowerCase();
    const doctor = doctors.find(d => d.doctor_id === doctorId);

    if (!doctor) {
      errorEl.textContent = 'Please select your name from the list.';
      errorEl.classList.remove('d-none');
      return;
    }

    if (!doctor.email) {
      errorEl.textContent = 'This doctor has no email on file. Ask admin to add one.';
      errorEl.classList.remove('d-none');
      return;
    }

    if (email !== doctor.email.toLowerCase()) {
      errorEl.textContent = 'Email does not match our records for this doctor.';
      errorEl.classList.remove('d-none');
      return;
    }

    AuthService.login(
      'doctor',
      doctor.doctor_id,
      `Dr. ${doctor.first_name} ${doctor.last_name}`,
      { specialty: doctor.specialty, email: doctor.email }
    );
    window.location.href = 'dashboard.html';
  });
});