const { Pool } = require('pg');
const crypto = require('crypto');

/**
 * User Preference Model
 * Handles user-specific configuration and preferences storage
 */
class UserPreference {
  constructor(db) {
    this.db = db;
    this.tableName = 'user_preferences';
  }

  /**
   * Create user preferences table if it doesn't exist
   */
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        preferences JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON ${this.tableName}(user_id);
    `;
    
    try {
      await this.db.query(query);
      console.log('User preferences table created/verified successfully');
    } catch (error) {
      console.error('Error creating user preferences table:', error);
      throw error;
    }
  }

  /**
   * Get user preferences by user ID
   * @param {string} userId - User identifier
   * @returns {Object|null} User preferences or null if not found
   */
  async getByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const query = `
      SELECT user_id, preferences, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        userId: result.rows[0].user_id,
        preferences: result.rows[0].preferences,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Create or update user preferences
   * @param {string} userId - User identifier
   * @param {Object} preferences - User preferences object
   * @returns {Object} Updated user preferences
   */
  async upsert(userId, preferences) {
    if (!userId || !preferences) {
      throw new Error('User ID and preferences are required');
    }

    // Validate preferences is an object
    if (typeof preferences !== 'object' || Array.isArray(preferences)) {
      throw new Error('Preferences must be an object');
    }

    const query = `
      INSERT INTO ${this.tableName} (user_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        preferences = $2,
        updated_at = CURRENT_TIMESTAMP
      RETURNING user_id, preferences, created_at, updated_at
    `;
    
    try {
      const result = await this.db.query(query, [userId, preferences]);
      return {
        userId: result.rows[0].user_id,
        preferences: result.rows[0].preferences,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
    } catch (error) {
      console.error('Error upserting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update specific preference keys for a user
   * @param {string} userId - User identifier
   * @param {Object} updates - Preference updates to apply
   * @returns {Object} Updated user preferences
   */
  async updatePreferences(userId, updates) {
    if (!userId || !updates) {
      throw new Error('User ID and updates are required');
    }

    // Get existing preferences
    let existingPrefs = {};
    const existing = await this.getByUserId(userId);
    if (existing) {
      existingPrefs = existing.preferences;
    }

    // Merge updates with existing preferences
    const mergedPrefs = { ...existingPrefs, ...updates };

    return await this.upsert(userId, mergedPrefs);
  }

  /**
   * Delete user preferences
   * @param {string} userId - User identifier
   * @returns {boolean} True if deleted, false if not found
   */
  async deleteByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const query = `
      DELETE FROM ${this.tableName}
      WHERE user_id = $1
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }

  /**
   * Get all user preferences (for admin purposes)
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Array} Array of user preferences
   */
  async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT user_id, preferences, created_at, updated_at
      FROM ${this.tableName}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const result = await this.db.query(query, [limit, offset]);
      return result.rows.map(row => ({
        userId: row.user_id,
        preferences: row.preferences,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting all user preferences:', error);
      throw error;
    }
  }

  /**
   * Initialize the model (create table)
   */
  async initialize() {
    await this.createTable();
  }
}

module.exports = UserPreference;