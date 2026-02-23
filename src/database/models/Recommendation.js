/**
 * Recommendation Model
 * Handles storage and retrieval of analysis recommendations
 */

const { Pool } = require('pg');
const config = require('../../config');
const logger = require('../../utils/logger');

class RecommendationModel {
  constructor(dbPool) {
    this.pool = dbPool || new Pool({
      connectionString: process.env.DATABASE_URL || config.database?.connectionString,
      max: config.database?.pool?.max || 20,
      idleTimeoutMillis: config.database?.pool?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.database?.pool?.connectionTimeoutMillis || 10000,
    });
    
    // Initialize Redis cache if available
    this.redis = null;
    if (config.cache?.enabled !== false) {
      const RedisClient = require('./redis');
      this.redis = new RedisClient();
    }
  }

  /**
   * Create a new recommendation record
   * @param {Object} recommendation - Recommendation data
   * @param {number} analysisId - Associated analysis ID
   * @returns {Promise<number>} - Created recommendation ID
   */
  async create(recommendation, analysisId) {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO recommendations (
          analysis_id, type, severity, message, suggestion, file_path, line_number, column_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const values = [
        analysisId,
        recommendation.type || 'unknown',
        recommendation.severity || 'low',
        recommendation.message || '',
        recommendation.suggestion || '',
        recommendation.file || null,
        recommendation.line || null,
        recommendation.column || null
      ];
      
      const result = await client.query(query, values);
      const recommendationId = result.rows[0].id;
      
      // Invalidate cache for this analysis
      if (this.redis) {
        await this.redis.del(`analysis:${analysisId}:recommendations`);
        await this.redis.del(`recommendations:file:${recommendation.file}`);
      }
      
      logger.info(`Created recommendation ${recommendationId} for analysis ${analysisId}`);
      return recommendationId;
    } catch (error) {
      logger.error('Error creating recommendation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create multiple recommendations in a batch
   * @param {Array} recommendations - Array of recommendation objects
   * @param {number} analysisId - Associated analysis ID
   * @returns {Promise<Array>} - Array of created recommendation IDs
   */
  async createBatch(recommendations, analysisId) {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }
    
    const client = await this.pool.connect();
    try {
      // Start transaction
      await client.query('BEGIN');
      
      const ids = [];
      for (const recommendation of recommendations) {
        const query = `
          INSERT INTO recommendations (
            analysis_id, type, severity, message, suggestion, file_path, line_number, column_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;
        
        const values = [
          analysisId,
          recommendation.type || 'unknown',
          recommendation.severity || 'low',
          recommendation.message || '',
          recommendation.suggestion || '',
          recommendation.file || null,
          recommendation.line || null,
          recommendation.column || null
        ];
        
        const result = await client.query(query, values);
        ids.push(result.rows[0].id);
      }
      
      await client.query('COMMIT');
      
      // Invalidate cache
      if (this.redis) {
        await this.redis.del(`analysis:${analysisId}:recommendations`);
        // Invalidate file-specific caches
        const uniqueFiles = [...new Set(recommendations.map(r => r.file).filter(Boolean))];
        for (const file of uniqueFiles) {
          await this.redis.del(`recommendations:file:${file}`);
        }
      }
      
      logger.info(`Created ${ids.length} recommendations for analysis ${analysisId}`);
      return ids;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating recommendation batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get recommendations by analysis ID
   * @param {number} analysisId - Analysis ID
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getByAnalysisId(analysisId) {
    // Try cache first
    if (this.redis) {
      const cached = await this.redis.get(`analysis:${analysisId}:recommendations`);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, analysis_id, type, severity, message, suggestion, file_path, 
               line_number, column_number, created_at
        FROM recommendations 
        WHERE analysis_id = $1
        ORDER BY severity DESC, created_at ASC
      `;
      
      const result = await client.query(query, [analysisId]);
      const recommendations = result.rows.map(row => ({
        id: row.id,
        analysisId: row.analysis_id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        suggestion: row.suggestion,
        file: row.file_path,
        line: row.line_number,
        column: row.column_number,
        createdAt: row.created_at
      }));
      
      // Cache the result
      if (this.redis) {
        await this.redis.setex(
          `analysis:${analysisId}:recommendations`, 
          3600, // 1 hour TTL
          JSON.stringify(recommendations)
        );
      }
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations by analysis ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get recommendations by file path
   * @param {string} filePath - File path
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getByFile(filePath, options = {}) {
    const { limit = 100, offset = 0, severity = null } = options;
    
    // Try cache first (for common queries)
    const cacheKey = `recommendations:file:${filePath}:${severity || 'all'}`;
    if (this.redis && limit <= 50 && offset === 0) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT id, analysis_id, type, severity, message, suggestion, file_path, 
               line_number, column_number, created_at
        FROM recommendations 
        WHERE file_path = $1
      `;
      
      const params = [filePath];
      let paramIndex = 2;
      
      if (severity) {
        query += ` AND severity = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await client.query(query, params);
      const recommendations = result.rows.map(row => ({
        id: row.id,
        analysisId: row.analysis_id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        suggestion: row.suggestion,
        file: row.file_path,
        line: row.line_number,
        column: row.column_number,
        createdAt: row.created_at
      }));
      
      // Cache common queries
      if (this.redis && limit <= 50 && offset === 0) {
        await this.redis.setex(cacheKey, 1800, JSON.stringify(recommendations)); // 30 min TTL
      }
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations by file:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get recommendations by severity
   * @param {string} severity - Severity level ('high', 'medium', 'low')
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getBySeverity(severity, options = {}) {
    const { limit = 100, offset = 0, days = 7 } = options;
    
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, analysis_id, type, severity, message, suggestion, file_path, 
               line_number, column_number, created_at
        FROM recommendations 
        WHERE severity = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await client.query(query, [severity, limit, offset]);
      return result.rows.map(row => ({
        id: row.id,
        analysisId: row.analysis_id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        suggestion: row.suggestion,
        file: row.file_path,
        line: row.line_number,
        column: row.column_number,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.error('Error getting recommendations by severity:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete recommendations by analysis ID
   * @param {number} analysisId - Analysis ID
   * @returns {Promise<number>} - Number of deleted records
   */
  async deleteByAnalysisId(analysisId) {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM recommendations WHERE analysis_id = $1';
      const result = await client.query(query, [analysisId]);
      
      // Invalidate cache
      if (this.redis) {
        await this.redis.del(`analysis:${analysisId}:recommendations`);
      }
      
      logger.info(`Deleted ${result.rowCount} recommendations for analysis ${analysisId}`);
      return result.rowCount;
    } catch (error) {
      logger.error('Error deleting recommendations by analysis ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get statistics about recommendations
   * @returns {Promise<Object>} - Statistics object
   */
  async getStatistics() {
    const client = await this.pool.connect();
    try {
      // Count by severity
      const severityQuery = `
        SELECT severity, COUNT(*) as count
        FROM recommendations 
        GROUP BY severity
      `;
      
      // Count by type
      const typeQuery = `
        SELECT type, COUNT(*) as count
        FROM recommendations 
        GROUP BY type
      `;
      
      // Total count and recent activity
      const statsQuery = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7d
        FROM recommendations
      `;
      
      const [severityResult, typeResult, statsResult] = await Promise.all([
        client.query(severityQuery),
        client.query(typeQuery),
        client.query(statsQuery)
      ]);
      
      return {
        totalCount: parseInt(statsResult.rows[0].total_count),
        last24Hours: parseInt(statsResult.rows[0].last_24h),
        last7Days: parseInt(statsResult.rows[0].last_7d),
        bySeverity: severityResult.rows.reduce((acc, row) => {
          acc[row.severity] = parseInt(row.count);
          return acc;
        }, {}),
        byType: typeResult.rows.reduce((acc, row) => {
          acc[row.type] = parseInt(row.count);
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Error getting recommendation statistics:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connections
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
    await this.pool.end();
  }
}

module.exports = RecommendationModel;