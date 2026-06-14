// src/app.js

const express = require('express');
const cors = require('cors');

// Import all route files
const patientRoutes = require('./routes/patients.routes');
const doctorRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const recordRoutes = require('./routes/records.routes');
const orderRoutes = require('./routes/orders.routes');

const app = express();

// ── MIDDLEWARE ──────────────────────────────────────────────────
/**
 * Middleware runs on EVERY request before it hits your routes.
 * Think of it as a pipeline each request passes through.
 */

// Parses incoming JSON request bodies (so req.body works)
app.use(express.json());

// Parses URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Allows requests from different origins (your future React frontend)
app.use(cors());

// ── HEALTH CHECK ROUTE ──────────────────────────────────────────
/**
 * A simple route to confirm the server is alive.
 * Very useful in production — load balancers and monitoring tools
 * (like AWS ALB, Kubernetes liveness probes) ping this constantly.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Nambikkai Health Care API is running',
    timestamp: new Date().toISOString()
  });
});

// ── ROUTES ──────────────────────────────────────────────────────
/**
 * We mount each router at a specific base path.
 * All routes inside patientRoutes will be prefixed with /api/patients
 */
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 HANDLER ─────────────────────────────────────────────────
// Catches any request that doesn't match a defined route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────
/**
 * Express recognizes a 4-argument middleware as an error handler.
 * Any route that calls next(error) will land here.
 * This prevents unhandled crashes from exposing stack traces to clients.
 */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;