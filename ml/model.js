/**
 * ML Model for DiffAgent - Enhanced with training data
 * Provides intelligent risk assessment and recommendation prioritization
 */

class MLModel {
  constructor(config = {}) {
    this.config = {
      defaultWeights: {
        security: 0.5,
        performance: 0.5,
        quality: 0.5,
        test: 0.5
      },
      riskThresholds: {
        low: 0.3,
        medium: 0.7,
        high: 1.0
      },
      ...config
    };
    
    this.weights = { ...this.config.defaultWeights };
    this.isTrained = false;
    this.trainingData = [];
  }

  /**
   * Train the model with training data
   * @param {Array} data - Training data from open source projects
   */
  train(data) {
    if (!data || data.length === 0) {
      console.warn('No training data provided, using default weights');
      return;
    }
    
    this.trainingData = data;
    this._calculateWeights();
    this.isTrained = true;
    console.log('✅ Model training completed!');
    console.log('📊 Updated weights:', this.weights);
  }

  /**
   * Calculate weights based on training data
   */
  _calculateWeights() {
    const typeCounts = {};
    const issueSums = { security: 0, performance: 0, quality: 0, test: 0 };
    const totalSamples = this.trainingData.length;
    
    // Count change types and sum issues
    this.trainingData.forEach(sample => {
      const type = sample.changeType || 'other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      
      issueSums.security += sample.securityIssues || 0;
      issueSums.performance += sample.performanceIssues || 0;
      issueSums.quality += sample.qualityIssues || 0;
      issueSums.test += sample.testIssues || 0;
    });
    
    // Calculate weights based on issue frequency
    const totalIssues = issueSums.security + issueSums.performance + issueSums.quality + issueSums.test;
    if (totalIssues > 0) {
      this.weights.security = Math.min(1.0, issueSums.security / totalIssues * 2);
      this.weights.performance = Math.min(1.0, issueSums.performance / totalIssues * 2);
      this.weights.quality = Math.min(1.0, issueSums.quality / totalIssues * 2);
      this.weights.test = Math.min(1.0, issueSums.test / totalIssues * 2);
    }
    
    // Adjust weights based on change types
    if (typeCounts.security_fix > 0) {
      this.weights.security = Math.max(this.weights.security, 0.8);
    }
    if (typeCounts.performance_optimization > 0) {
      this.weights.performance = Math.max(this.weights.performance, 0.8);
    }
    if (typeCounts.bug_fix > 0) {
      this.weights.test = Math.max(this.weights.test, 0.7);
    }
  }

  /**
   * Predict risk score and recommendations for a given change
   * @param {Object} features - Extracted features from code changes
   * @returns {Object} Prediction result
   */
  predict(features) {
    const changeType = features.changeType || 'other';
    
    // Base risk score based on change type
    let baseRisk = 0.1;
    switch (changeType) {
      case 'security_fix':
        baseRisk = 0.8;
        break;
      case 'bug_fix':
        baseRisk = 0.4;
        break;
      case 'feature':
        baseRisk = 0.3;
        break;
      case 'performance_optimization':
        baseRisk = 0.5;
        break;
      case 'refactor':
        baseRisk = 0.2;
        break;
      default:
        baseRisk = 0.1;
    }
    
    // Apply weights to calculate final risk score
    const riskScore = baseRisk;
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore > this.config.riskThresholds.medium) {
      riskLevel = 'high';
    } else if (riskScore > this.config.riskThresholds.low) {
      riskLevel = 'medium';
    }
    
    // Determine recommended checks based on change type and weights
    const recommendedChecks = [];
    
    switch (changeType) {
      case 'security_fix':
        recommendedChecks.push('security', 'test');
        break;
      case 'bug_fix':
        recommendedChecks.push('test', 'quality');
        break;
      case 'feature':
        recommendedChecks.push('quality', 'test', 'security');
        break;
      case 'performance_optimization':
        recommendedChecks.push('performance', 'test');
        break;
      case 'refactor':
        recommendedChecks.push('quality', 'test');
        break;
      default:
        recommendedChecks.push('quality');
    }
    
    // Filter recommendations based on weights
    const filteredChecks = recommendedChecks.filter(check => {
      const weight = this.weights[check];
      return weight > 0.3; // Only recommend if weight is significant
    });
    
    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      recommendedChecks: filteredChecks
    };
  }

  /**
   * Get model status
   */
  getStatus() {
    return {
      isTrained: this.isTrained,
      weights: { ...this.weights },
      trainingSamples: this.trainingData.length
    };
  }
}

module.exports = MLModel;