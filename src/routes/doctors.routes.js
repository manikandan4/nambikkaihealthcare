// src/routes/doctors.routes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── GET ALL DOCTORS ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Doctors ORDER BY doctor_id DESC');
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET SINGLE DOCTOR ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Doctors WHERE doctor_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── CREATE DOCTOR ─────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, specialty, email } = req.body;

    if (!first_name || !last_name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'first_name, last_name, and specialty are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO Doctors (first_name, last_name, specialty, email) VALUES (?, ?, ?, ?)`,
      [first_name, last_name, specialty, email]
    );

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── UPDATE DOCTOR ─────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, specialty, email } = req.body;

    const [result] = await db.query(
      `UPDATE Doctors SET first_name=?, last_name=?, specialty=?, email=? WHERE doctor_id=?`,
      [first_name, last_name, specialty, email, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE DOCTOR ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Doctors WHERE doctor_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;