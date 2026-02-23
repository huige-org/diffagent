const { Pool } = require('pg');

async function testPostgresConnection() {
  try {
    // Try to connect to local PostgreSQL with default credentials
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await pool.end();
    
    console.log('✅ PostgreSQL connection successful!');
    console.log('Current time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Also test if we can use SQLite as fallback
async function testSQLiteConnection() {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(':memory:');
    db.close();
    console.log('✅ SQLite is available as fallback');
    return true;
  } catch (error) {
    console.log('❌ SQLite not available:', error.message);
    return false;
  }
}

module.exports = { testPostgresConnection, testSQLiteConnection };