// src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── GET ALL APPOINTMENTS (with patient & doctor names via JOIN) ────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.appointment_id,
        a.patient_id,
        a.doctor_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        d.specialty,
        a.appointment_datetime,
        a.status,
        a.reason_for_visit
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_datetime DESC
    `);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET SINGLE APPOINTMENT ────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
       FROM Appointments a
       JOIN Patients p ON a.patient_id = p.patient_id
       JOIN Doctors d ON a.doctor_id = d.doctor_id
       WHERE a.appointment_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── CREATE APPOINTMENT ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_datetime, status, reason_for_visit } = req.body;

    if (!patient_id || !doctor_id || !appointment_datetime) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, doctor_id, and appointment_datetime are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO Appointments (patient_id, doctor_id, appointment_datetime, status, reason_for_visit)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_datetime, status || 'Scheduled', reason_for_visit]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── UPDATE APPOINTMENT ────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_datetime, status, reason_for_visit } = req.body;

    const [result] = await db.query(
      `UPDATE Appointments 
       SET patient_id=?, doctor_id=?, appointment_datetime=?, status=?, reason_for_visit=?
       WHERE appointment_id=?`,
      [patient_id, doctor_id, appointment_datetime, status, reason_for_visit, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE APPOINTMENT ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Appointments WHERE appointment_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;