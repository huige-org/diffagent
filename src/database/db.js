/**
 * Database Abstraction Layer
 * Supports multiple database backends: PostgreSQL, Memory (for testing)
 */

const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.mode = config.database.mode || 'memory';
    this.connected = false;
    this.client = null;
  }

  async connect() {
    try {
      if (this.mode === 'postgres') {
        // PostgreSQL connection
        const { Pool } = require('pg');
        this.client = new Pool({
          host: config.database.postgres.host,
          port: config.database.postgres.port,
          database: config.database.postgres.database,
          user: config.database.postgres.user,
          password: config.database.postgres.password,
          max: config.database.postgres.pool.max,
          idleTimeoutMillis: config.database.postgres.pool.idleTimeoutMillis,
          connectionTimeoutMillis: config.database.postgres.pool.connectionTimeoutMillis,
        });
        
        // Test connection
        const client = await this.client.connect();
        await client.query('SELECT NOW()');
        client.release();
        
      } else {
        // Memory mode (default for testing/development)
        const MemoryDB = require('./memory');
        this.client = new MemoryDB();
      }
      
      this.connected = true;
      console.log(`✅ Database connected in ${this.mode} mode`);
      return this.client;
    } catch (error) {
      console.error(`❌ Database connection failed in ${this.mode} mode:`, error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.mode === 'postgres') {
      await this.client.end();
    }
    this.connected = false;
  }

  // Analysis Results
  async saveAnalysisResult(result) {
    if (!this.connected) await this.connect();
    
    const analysisId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const analysisData = {
      id: analysisId,
      file_path: result.file_path || '',
      language: result.language || 'unknown',
      change_type: result.changeType || 'other',
      confidence: result.confidence || 0,
      analysis_data: JSON.stringify(result),
      created_at: timestamp,
      updated_at: timestamp
    };
    
    if (this.mode === 'postgres') {
      const query = `
        INSERT INTO analysis_results (id, file_path, language, change_type, confidence, analysis_data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      const values = [
        analysisData.id,
        analysisData.file_path,
        analysisData.language,
        analysisData.change_type,
        analysisData.confidence,
        analysisData.analysis_data,
        analysisData.created_at,
        analysisData.updated_at
      ];
      
      const result = await this.client.query(query, values);
      return result.rows[0].id;
    } else {
      // Memory mode
      const saved = await this.client.createAnalysisResult(analysisData);
      return saved.id;
    }
  }

  async getAnalysisResult(id) {
    if (!this.connected) await this.connect();
    
    if (this.mode === 'postgres') {
      const query = 'SELECT * FROM analysis_results WHERE id = $1';
      const result = await this.client.query(query, [id]);
      return result.rows[0] ? JSON.parse(result.rows[0].analysis_data) : null;
    } else {
      const result = await this.client.getAnalysisResult(id);
      return result ? JSON.parse(result.analysis_data) : null;
    }
  }

  // Recommendations
  async saveRecommendations(analysisId, recommendations) {
    if (!this.connected) await this.connect();
    
    const savedRecs = [];
    for (const rec of recommendations) {
      const recData = {
        id: uuidv4(),
        analysis_id: analysisId,
        type: rec.type || 'general',
        severity: rec.severity || 'low',
        message: rec.message || '',
        suggestion: rec.suggestion || '',
        file_path: rec.file || '',
        created_at: new Date().toISOString()
      };
      
      if (this.mode === 'postgres') {
        const query = `
          INSERT INTO recommendations (id, analysis_id, type, severity, message, suggestion, file_path, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;
        const values = [
          recData.id,
          recData.analysis_id,
          recData.type,
          recData.severity,
          recData.message,
          recData.suggestion,
          recData.file_path,
          recData.created_at
        ];
        const result = await this.client.query(query, values);
        savedRecs.push(result.rows[0].id);
      } else {
        const saved = await this.client.createRecommendation(recData);
        savedRecs.push(saved.id);
      }
    }
    
    return savedRecs;
  }

  async getRecommendations(analysisId) {
    if (!this.connected) await this.connect();
    
    if (this.mode === 'postgres') {
      const query = 'SELECT * FROM recommendations WHERE analysis_id = $1 ORDER BY created_at DESC';
      const result = await this.client.query(query, [analysisId]);
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        suggestion: row.suggestion,
        file: row.file_path,
        createdAt: row.created_at
      }));
    } else {
      const recs = await this.client.getRecommendationsByAnalysisId(analysisId);
      return recs.map(rec => ({
        id: rec.id,
        type: rec.type,
        severity: rec.severity,
        message: rec.message,
        suggestion: rec.suggestion,
        file: rec.file_path,
        createdAt: rec.created_at
      }));
    }
  }

  // User Preferences
  async saveUserPreferences(userId, preferences) {
    if (!this.connected) await this.connect();
    
    const prefData = {
      id: uuidv4(),
      user_id: userId,
      preferences: JSON.stringify(preferences),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (this.mode === 'postgres') {
      const query = `
        INSERT INTO user_preferences (id, user_id, preferences, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          preferences = $3,
          updated_at = $5
        RETURNING id
      `;
      const values = [
        prefData.id,
        prefData.user_id,
        prefData.preferences,
        prefData.created_at,
        prefData.updated_at
      ];
      const result = await this.client.query(query, values);
      return result.rows[0].id;
    } else {
      const existing = await this.client.getUserPreference(userId);
      if (existing) {
        const updated = await this.client.updateUserPreference(userId, preferences);
        return updated.id;
      } else {
        const saved = await this.client.createUserPreference(prefData);
        return saved.id;
      }
    }
  }

  async getUserPreferences(userId) {
    if (!this.connected) await this.connect();
    
    if (this.mode === 'postgres') {
      const query = 'SELECT preferences FROM user_preferences WHERE user_id = $1';
      const result = await this.client.query(query, [userId]);
      return result.rows[0] ? JSON.parse(result.rows[0].preferences) : null;
    } else {
      const result = await this.client.getUserPreference(userId);
      return result ? JSON.parse(result.preferences) : null;
    }
  }

  async close() {
    await this.disconnect();
  }

  async healthCheck() {
    if (!this.connected) await this.connect();
    
    if (this.mode === 'postgres') {
      const result = await this.client.query('SELECT NOW()');
      return {
        status: 'healthy',
        type: 'postgres',
        timestamp: result.rows[0].now
      };
    } else {
      return await this.client.healthCheck();
    }
  }
}

const DatabaseManager = Database;
module.exports = { DatabaseManager };