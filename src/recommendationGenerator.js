/**
 * Recommendation Generator for DiffAgent
 * Generates actionable recommendations based on diff analysis
 */

class RecommendationGenerator {
  constructor(config = {}) {
    this.config = {
      enableSecurityChecks: true,
      enablePerformanceChecks: true,
      enableBestPracticeChecks: true,
      ...config
    };
  }

  /**
   * Generate recommendations based on analysis results
   * @param {Object} analysis - Complete analysis results from DiffAgent
   * @returns {Array} Array of recommendation objects
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Handle case where analysis might not have expected structure
    if (!analysis || !analysis.files || !Array.isArray(analysis.files)) {
      return recommendations;
    }

    // Analyze change types and generate recommendations
    const changeTypes = this._extractChangeTypes(analysis.files);
    
    // Generate recommendations based on change types
    if (changeTypes.bug_fix && changeTypes.bug_fix > 0) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        message: 'Bug fix detected. Ensure proper test coverage for the fixed issue.',
        category: 'testing'
      });
    }
    
    if ((changeTypes.feature || changeTypes.feature_addition) && (changeTypes.feature > 0 || changeTypes.feature_addition > 0)) {
      recommendations.push({
        type: 'review',
        priority: 'medium',
        message: 'New feature added. Verify documentation and error handling.',
        category: 'documentation'
      });
    }
    
    if (changeTypes.refactor && changeTypes.refactor > 0) {
      recommendations.push({
        type: 'review',
        priority: 'medium',
        message: 'Code refactoring detected. Ensure no functional changes were introduced.',
        category: 'testing'
      });
    }
    
    // Risk-based recommendations
    if (analysis.riskScore && analysis.riskScore > 0.7) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        message: `High risk score (${Math.round(analysis.riskScore * 100)}%). Requires thorough review.`,
        category: 'risk'
      });
    } else if (analysis.riskScore && analysis.riskScore > 0.4) {
      recommendations.push({
        type: 'info',
        priority: 'medium',
        message: `Medium risk score (${Math.round(analysis.riskScore * 100)}%). Standard review recommended.`,
        category: 'risk'
      });
    }
    
    // File count recommendations
    if (analysis.files && analysis.files.length > 5) {
      recommendations.push({
        type: 'info',
        priority: 'low',
        message: 'Large diff detected (>5 files). Consider breaking into smaller PRs.',
        category: 'process'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Extract change type counts from classified files
   * @param {Array} files - Array of classified files
   * @returns {Object} Object with change type counts
   */
  _extractChangeTypes(files) {
    const changeTypes = {};
    
    files.forEach(file => {
      const changeType = file.classification?.changeType;
      if (changeType) {
        changeTypes[changeType] = (changeTypes[changeType] || 0) + 1;
      }
    });
    
    return changeTypes;
  }
}

module.exports = RecommendationGenerator;