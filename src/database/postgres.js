const { Pool } = require('pg');
const path = require('path');

class PostgresDB {
  constructor(config = {}) {
    this.config = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'diffagent_db',
      user: process.env.POSTGRES_USER || 'diffagent_user',
      password: process.env.POSTGRES_PASSWORD || 'secure_password_123',
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 60000,
      ssl: config.ssl || false
    };

    this.pool = new Pool(this.config);
    
    // Test connection on startup
    this.testConnection();
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL connection established successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      throw error;
    }
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query in', duration, 'ms:', text);
      return res;
    } catch (error) {
      console.error('Query error:', error.message, 'Query:', text);
      throw error;
    }
  }

  async getClient() {
    return this.pool.connect();
  }

  async close() {
    await this.pool.end();
    console.log('PostgreSQL connection pool closed');
  }
}

module.exports = PostgresDB;