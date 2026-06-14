// src/routes/patients.routes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── GET ALL PATIENTS ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Patients ORDER BY patient_id DESC');
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET SINGLE PATIENT BY ID ──────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Patients WHERE patient_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── CREATE NEW PATIENT ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, phone_number, blood_group } = req.body;

    // Basic validation
    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'first_name, last_name, date_of_birth, and gender are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO Patients (first_name, last_name, date_of_birth, gender, phone_number, blood_group)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, date_of_birth, gender, phone_number, blood_group]
    );

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      patient_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── UPDATE PATIENT ────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, phone_number, blood_group } = req.body;

    const [result] = await db.query(
      `UPDATE Patients 
       SET first_name=?, last_name=?, date_of_birth=?, gender=?, phone_number=?, blood_group=?
       WHERE patient_id=?`,
      [first_name, last_name, date_of_birth, gender, phone_number, blood_group, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE PATIENT ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Patients WHERE patient_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;