/**
 * Database Initialization Script
 * Initializes database connections and runs migrations
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class DatabaseInitializer {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async initialize() {
    try {
      // Initialize PostgreSQL connection
      this.pool = new Pool({
        host: this.config.database.postgres.host,
        port: this.config.database.postgres.port,
        database: this.config.database.postgres.database,
        user: this.config.database.postgres.user,
        password: this.config.database.postgres.password,
        max: this.config.database.postgres.pool.max,
        idleTimeoutMillis: this.config.database.postgres.pool.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.database.postgres.pool.connectionTimeoutMillis,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL connection established');

      // Run migrations
      await this.runMigrations();

      return this.pool;
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    const migrationDir = path.join(__dirname, 'migrations');
    const migrationFiles = await fs.readdir(migrationDir);
    
    // Sort migrations by filename (assumes timestamp prefix)
    const sortedMigrations = migrationFiles
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const migrationFile of sortedMigrations) {
      const migrationPath = path.join(migrationDir, migrationFile);
      const migration = require(migrationPath);
      
      try {
        await migration.up(this.pool);
        console.log(`✅ Applied migration: ${migrationFile}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Migration already applied: ${migrationFile}`);
        } else {
          console.error(`❌ Migration failed: ${migrationFile}`, error.message);
          throw error;
        }
      }
    }
  }

  getPool() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = DatabaseInitializer;