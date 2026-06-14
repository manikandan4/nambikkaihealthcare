// server.js

require('dotenv').config(); // Load .env variables first
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

/**
 * Test the DB connection before starting the server.
 * If the database is unreachable, we fail fast with a clear error
 * instead of starting a broken server that crashes on first request.
 */
async function startServer() {
  try {
    // Execute a simple test query to verify DB connectivity
    await db.query('SELECT 1');
    console.log('✅ MySQL database connected successfully');

    app.listen(PORT, () => {
      console.log(`🏥 Nambikkai Health Care API`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1); // Exit process with failure code
  }
}

startServer();