/**
 * Analysis Result Model
 * Handles storage and retrieval of code analysis results
 */

const { pool } = require('../postgres');
const redis = require('../redis');

class AnalysisResult {
  /**
   * Save analysis result to database
   * @param {Object} analysisData - Analysis result data
   * @returns {Promise<number>} - Inserted record ID
   */
  static async save(analysisData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert analysis result
      const analysisResult = await client.query(
        `INSERT INTO analysis_results 
         (file_path, language, change_type, confidence, analysis_data) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          analysisData.filePath,
          analysisData.language,
          analysisData.changeType,
          analysisData.confidence,
          JSON.stringify(analysisData.analysisData || {})
        ]
      );
      
      const analysisId = analysisResult.rows[0].id;
      
      // Insert recommendations if they exist
      if (analysisData.recommendations && analysisData.recommendations.length > 0) {
        const recommendationValues = analysisData.recommendations.map(rec => [
          analysisId,
          rec.type,
          rec.severity,
          rec.message,
          rec.suggestion || '',
          rec.filePath || analysisData.filePath
        ]);
        
        const recommendationQuery = `
          INSERT INTO recommendations 
          (analysis_id, type, severity, message, suggestion, file_path) 
          VALUES ${recommendationValues.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
        `;
        
        const recommendationParams = recommendationValues.flat();
        await client.query(recommendationQuery, recommendationParams);
      }
      
      await client.query('COMMIT');
      
      // Cache the result in Redis
      const cacheKey = `analysis:${analysisData.filePath}:${Date.now()}`;
      await redis.setex(cacheKey, 3600, JSON.stringify({
        id: analysisId,
        ...analysisData
      }));
      
      return analysisId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find analysis results by file path
   * @param {string} filePath - File path to search for
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Array of analysis results
   */
  static async findByFilePath(filePath, limit = 10) {
    // Try Redis cache first
    const cacheKey = `analysis:file:${filePath}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT ar.*, 
                json_agg(
                  json_build_object(
                    'type', r.type,
                    'severity', r.severity, 
                    'message', r.message,
                    'suggestion', r.suggestion,
                    'file_path', r.file_path
                  )
                ) as recommendations
         FROM analysis_results ar
         LEFT JOIN recommendations r ON ar.id = r.analysis_id
         WHERE ar.file_path = $1
         GROUP BY ar.id
         ORDER BY ar.created_at DESC
         LIMIT $2`,
        [filePath, limit]
      );
      
      const formattedResults = result.rows.map(row => ({
        id: row.id,
        filePath: row.file_path,
        language: row.language,
        changeType: row.change_type,
        confidence: parseFloat(row.confidence),
        analysisData: row.analysis_data,
        recommendations: row.recommendations.filter(r => r.type), // Remove null recommendations
        createdAt: row.created_at
      }));
      
      // Cache the result
      await redis.setex(cacheKey, 1800, JSON.stringify(formattedResults));
      
      return formattedResults;
    } finally {
      client.release();
    }
  }

  /**
   * Find analysis results by language and date range
   * @param {string} language - Programming language
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} - Analysis results
   */
  static async findByLanguage(language, startDate = null, endDate = null, limit = 50) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT ar.*, 
               json_agg(
                 json_build_object(
                   'type', r.type,
                   'severity', r.severity,
                   'message', r.message,
                   'suggestion', r.suggestion,
                   'file_path', r.file_path
                 )
               ) as recommendations
        FROM analysis_results ar
        LEFT JOIN recommendations r ON ar.id = r.analysis_id
        WHERE ar.language = $1
      `;
      
      const params = [language];
      let paramIndex = 2;
      
      if (startDate) {
        query += ` AND ar.created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        query += ` AND ar.created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }
      
      query += `
        GROUP BY ar.id
        ORDER BY ar.created_at DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);
      
      const result = await client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        filePath: row.file_path,
        language: row.language,
        changeType: row.change_type,
        confidence: parseFloat(row.confidence),
        analysisData: row.analysis_data,
        recommendations: row.recommendations.filter(r => r.type),
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Get statistics summary
   * @returns {Promise<Object>} - Statistics object
   */
  static async getStatistics() {
    const client = await pool.connect();
    try {
      // Overall statistics
      const statsResult = await client.query(`
        SELECT 
          COUNT(*) as total_analyses,
          COUNT(DISTINCT file_path) as unique_files,
          COUNT(DISTINCT language) as languages,
          AVG(confidence) as avg_confidence,
          MAX(created_at) as last_analysis
        FROM analysis_results
      `);
      
      // Language breakdown
      const languageResult = await client.query(`
        SELECT language, COUNT(*) as count
        FROM analysis_results
        GROUP BY language
        ORDER BY count DESC
      `);
      
      // Severity breakdown
      const severityResult = await client.query(`
        SELECT r.severity, COUNT(*) as count
        FROM recommendations r
        GROUP BY r.severity
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END
      `);
      
      return {
        overall: statsResult.rows[0],
        languages: languageResult.rows,
        severities: severityityResult.rows
      };
    } finally {
      client.release();
    }
  }
}

module.exports = AnalysisResult;