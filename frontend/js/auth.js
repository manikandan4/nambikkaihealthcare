/**
 * Authentication Service - demo session with role + identity
 * Admin: no linked DB record
 * Doctor/Patient: linked to a real row via userId
 */

class AuthService {
  static STORAGE_KEY = 'healthcare_user';
  static ROLES = { ADMIN: 'admin', DOCTOR: 'doctor', PATIENT: 'patient' };

  /**
   * @param {string} role - admin | doctor | patient
   * @param {number|null} userId - doctor_id or patient_id
   * @param {string} displayName - shown in navbar
   * @param {object} profile - extra fields (specialty, email, dob, etc.)
   */
  static login(role, userId = null, displayName = null, profile = {}) {
    if (!Object.values(this.ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    const user = {
      role,
      userId,
      displayName: displayName || role,
      profile,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  static getCurrentUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  static isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  static logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getRole() {
    return this.getCurrentUser()?.role || null;
  }

  /** doctor_id or patient_id — null for admin */
  static getUserId() {
    const id = this.getCurrentUser()?.userId;
    return id != null ? Number(id) : null;
  }

  static getDisplayName() {
    return this.getCurrentUser()?.displayName || 'User';
  }

  static getProfile() {
    return this.getCurrentUser()?.profile || {};
  }

  /** Doctor/patient must have a linked ID before entering the app */
  static hasIdentity() {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === this.ROLES.ADMIN) return true;
    return user.userId != null;
  }

  static loginPageForRole(role) {
    const pages = {
      admin: 'login-admin.html',
      doctor: 'login-doctor.html',
      patient: 'login-patient.html'
    };
    return pages[role] || 'index.html';
  }
}