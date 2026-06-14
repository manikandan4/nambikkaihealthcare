// src/config/db.js

const mysql = require('mysql2');
require('dotenv').config();

/**
 * We use a CONNECTION POOL instead of a single connection.
 * A pool maintains multiple reusable database connections.
 * When a request comes in, it borrows a connection from the pool,
 * uses it, and returns it — very efficient for web APIs.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,   // Queue requests if all connections are busy
  connectionLimit: 10,         // Max 10 simultaneous connections
  queueLimit: 0               // Unlimited queue size (0 = no limit)
});

// .promise() gives us async/await support instead of callbacks
const promisePool = pool.promise();

module.exports = promisePool;