/**
 * API Service - Centralized API communication layer
 * Handles all fetch requests to the backend API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  /**
   * Make a generic API request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} data - Request body data
   * @returns {Promise<object>} - API response
   */
  static async request(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ─── PATIENTS ENDPOINTS ──────────────────────────────────────────
  static getPatients() {
    return this.request('/patients');
  }

  static getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  static createPatient(data) {
    return this.request('/patients', 'POST', data);
  }

  static updatePatient(id, data) {
    return this.request(`/patients/${id}`, 'PUT', data);
  }

  static deletePatient(id) {
    return this.request(`/patients/${id}`, 'DELETE');
  }

  // ─── DOCTORS ENDPOINTS ───────────────────────────────────────────
  static getDoctors() {
    return this.request('/doctors');
  }

  static getDoctor(id) {
    return this.request(`/doctors/${id}`);
  }

  static createDoctor(data) {
    return this.request('/doctors', 'POST', data);
  }

  static updateDoctor(id, data) {
    return this.request(`/doctors/${id}`, 'PUT', data);
  }

  static deleteDoctor(id) {
    return this.request(`/doctors/${id}`, 'DELETE');
  }

  // ─── APPOINTMENTS ENDPOINTS ──────────────────────────────────────
  static getAppointments() {
    return this.request('/appointments');
  }

  static getAppointment(id) {
    return this.request(`/appointments/${id}`);
  }

  static createAppointment(data) {
    return this.request('/appointments', 'POST', data);
  }

  static updateAppointment(id, data) {
    return this.request(`/appointments/${id}`, 'PUT', data);
  }

  static deleteAppointment(id) {
    return this.request(`/appointments/${id}`, 'DELETE');
  }

  // ─── MEDICAL RECORDS ENDPOINTS ───────────────────────────────────
  static getRecords() {
    return this.request('/records');
  }

  static getRecord(id) {
    return this.request(`/records/${id}`);
  }

  static createRecord(data) {
    return this.request('/records', 'POST', data);
  }

  static updateRecord(id, data) {
    return this.request(`/records/${id}`, 'PUT', data);
  }

  static deleteRecord(id) {
    return this.request(`/records/${id}`, 'DELETE');
  }

  // ─── CLINICAL ORDERS ENDPOINTS ───────────────────────────────────
  static getOrders() {
    return this.request('/orders');
  }

  static getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  static createOrder(data) {
    return this.request('/orders', 'POST', data);
  }

  static updateOrder(id, data) {
    return this.request(`/orders/${id}`, 'PUT', data);
  }

  static deleteOrder(id) {
    return this.request(`/orders/${id}`, 'DELETE');
  }
}
