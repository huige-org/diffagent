/**
 * ML Integrator - Integrates ML model with DiffAgent
 */
const Model = require('./model');

class MLIntegrator {
  constructor(config = {}) {
    this.config = config;
    this.model = new Model(config);
  }

  /**
   * Integrate ML model with DiffAgent analysis
   * @param {Object} diffAnalysis - Original DiffAgent analysis result
   * @param {Array} trainingData - Training data for model enhancement
   * @returns {Object} Enhanced analysis result with ML predictions
   */
  integrate(diffAnalysis, trainingData) {
    try {
      // Train model with available data
      if (trainingData && trainingData.length > 0) {
        this.model.train(trainingData);
      }
      
      // Enhance the analysis with ML predictions
      const mlEnhancement = this.model.predict(diffAnalysis);
      
      return {
        ...diffAnalysis,
        mlEnhanced: true,
        mlPredictions: mlEnhancement,
        enhancedRiskScore: mlEnhancement.riskScore,
        enhancedRecommendations: mlEnhancement.recommendedChecks
      };
    } catch (error) {
      console.warn('ML integration failed:', error.message);
      return {
        ...diffAnalysis,
        mlEnhanced: false,
        mlError: error.message
      };
    }
  }

  /**
   * Get model status
   */
  getModelStatus() {
    return this.model.getStatus();
  }
}

module.exports = MLIntegrator;