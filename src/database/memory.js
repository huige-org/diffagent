/**
 * Memory Database Adapter
 * Provides in-memory storage for testing and development
 */

class MemoryDatabase {
  constructor() {
    this.analysisResults = new Map();
    this.recommendations = new Map();
    this.userPreferences = new Map();
    this.nextId = 1;
  }

  async connect() {
    console.log('✅ Using memory database (development mode)');
    return true;
  }

  async disconnect() {
    // Clear all data
    this.analysisResults.clear();
    this.recommendations.clear();
    this.userPreferences.clear();
    return true;
  }

  // Analysis Results
  async createAnalysisResult(data) {
    const id = this.nextId++;
    const result = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async getAnalysisResult(id) {
    return this.analysisResults.get(id) || null;
  }

  async getAnalysisResultsByFile(file_path) {
    return Array.from(this.analysisResults.values())
      .filter(result => result.file_path === file_path);
  }

  async getAnalysisResultsByLanguage(language) {
    return Array.from(this.analysisResults.values())
      .filter(result => result.language === language);
  }

  // Recommendations
  async createRecommendation(data) {
    const id = this.nextId++;
    const recommendation = {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByAnalysisId(analysis_id) {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.analysis_id === analysis_id);
  }

  async getRecommendationsBySeverity(severity) {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.severity === severity);
  }

  // User Preferences
  async createUserPreference(data) {
    const id = this.nextId++;
    const preference = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.userPreferences.set(data.user_id, preference);
    return preference;
  }

  async getUserPreference(userId) {
    return this.userPreferences.get(userId) || null;
  }

  async updateUserPreference(userId, preferences) {
    const existing = this.userPreferences.get(userId);
    if (!existing) {
      return await this.createUserPreference({ user_id: userId, preferences });
    }
    
    const updated = {
      ...existing,
      preferences: { ...existing.preferences, ...preferences },
      updated_at: new Date().toISOString()
    };
    this.userPreferences.set(userId, updated);
    return updated;
  }

  // Health check
  async healthCheck() {
    return {
      status: 'healthy',
      type: 'memory',
      analysisResults: this.analysisResults.size,
      recommendations: this.recommendations.size,
      userPreferences: this.userPreferences.size
    };
  }
}

module.exports = MemoryDatabase;