// src/routes/records.routes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── GET ALL MEDICAL RECORDS ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        mr.record_id,
        mr.patient_id,
        mr.doctor_id,
        mr.visit_date,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
        mr.symptoms,
        mr.diagnosis,
        mr.notes
      FROM Medical_Records mr
      JOIN Patients p ON mr.patient_id = p.patient_id
      JOIN Doctors d ON mr.doctor_id = d.doctor_id
      ORDER BY mr.visit_date DESC
    `);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET SINGLE RECORD ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT mr.*, 
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
       FROM Medical_Records mr
       JOIN Patients p ON mr.patient_id = p.patient_id
       JOIN Doctors d ON mr.doctor_id = d.doctor_id
       WHERE mr.record_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── CREATE MEDICAL RECORD ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, visit_date, symptoms, diagnosis, notes } = req.body;

    if (!patient_id || !doctor_id || !visit_date || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, doctor_id, visit_date, and diagnosis are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO Medical_Records (patient_id, doctor_id, visit_date, symptoms, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, visit_date, symptoms, diagnosis, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── UPDATE MEDICAL RECORD ─────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_id, visit_date, symptoms, diagnosis, notes } = req.body;

    const [result] = await db.query(
      `UPDATE Medical_Records 
       SET patient_id=?, doctor_id=?, visit_date=?, symptoms=?, diagnosis=?, notes=?
       WHERE record_id=?`,
      [patient_id, doctor_id, visit_date, symptoms, diagnosis, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    res.status(200).json({ success: true, message: 'Medical record updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE MEDICAL RECORD ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Medical_Records WHERE record_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    res.status(200).json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;