// src/routes/orders.routes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── GET ALL ORDERS ────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        co.order_id,
        co.patient_id,
        co.doctor_id,
        co.order_date,
        co.order_type,
        co.order_description,
        co.status,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
      FROM Clinical_Orders co
      JOIN Patients p ON co.patient_id = p.patient_id
      JOIN Doctors d ON co.doctor_id = d.doctor_id
      ORDER BY co.order_date DESC
    `);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET SINGLE ORDER ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT co.*,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
       FROM Clinical_Orders co
       JOIN Patients p ON co.patient_id = p.patient_id
       JOIN Doctors d ON co.doctor_id = d.doctor_id
       WHERE co.order_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clinical order not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── CREATE ORDER ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, order_type, order_description, order_date, status } = req.body;

    if (!patient_id || !doctor_id || !order_type || !order_description || !order_date) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, doctor_id, order_type, order_description, and order_date are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO Clinical_Orders (patient_id, doctor_id, order_type, order_description, order_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, order_type, order_description, order_date, status || 'Pending']
    );

    res.status(201).json({
      success: true,
      message: 'Clinical order created successfully',
      order_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── UPDATE ORDER ──────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_id, order_type, order_description, order_date, status } = req.body;

    const [result] = await db.query(
      `UPDATE Clinical_Orders 
       SET patient_id=?, doctor_id=?, order_type=?, order_description=?, order_date=?, status=?
       WHERE order_id=?`,
      [patient_id, doctor_id, order_type, order_description, order_date, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Clinical order not found' });
    }

    res.status(200).json({ success: true, message: 'Clinical order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE ORDER ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Clinical_Orders WHERE order_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Clinical order not found' });
    }

    res.status(200).json({ success: true, message: 'Clinical order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;