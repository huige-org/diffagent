/**
 * ML Integrator - Integrates ML model with DiffAgent core
 */
const fs = require('fs');
const path = require('path');

// Load ML model directly with correct path
let MLModel;
try {
  MLModel = require('../ml/model.js');
} catch (error) {
  console.warn('ML model not available:', error.message);
  MLModel = null;
}

class MLIntegrator {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled !== false,
      trainingDataPath: config.trainingDataPath || path.join(__dirname, '../ml/training-data.json'),
      ...config
    };
    
    this.mlModel = null;
    this.isInitialized = false;
    
    // Initialize synchronously if possible
    this._initializeSync();
  }

  /**
   * Synchronous initialization of ML model
   */
  _initializeSync() {
    if (!this.config.enabled || !MLModel) {
      return;
    }

    try {
      // Load training data
      const trainingData = JSON.parse(fs.readFileSync(this.config.trainingDataPath, 'utf8'));
      
      // Initialize ML model
      this.mlModel = new MLModel();
      
      // Train the model with existing data
      this.mlModel.train(trainingData);
      
      this.isInitialized = true;
      console.log('ML model initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize ML model:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Enhance analysis with ML predictions
   * @param {Array} classifiedFiles - Classified files
   * @param {Object} riskAssessment - Original risk assessment
   * @returns {Object} Enhanced risk assessment
   */
  enhanceRiskAssessment(classifiedFiles, riskAssessment) {
    if (!this.isInitialized || !this.mlModel) {
      return riskAssessment;
    }

    try {
      // Extract features for ML prediction
      const mlFeatures = this._extractMLFeatures(classifiedFiles);
      
      // Get ML prediction
      const mlPrediction = this.mlModel.predict(mlFeatures);
      
      // Enhance the risk assessment
      const enhancedRisk = {
        ...riskAssessment,
        mlEnhanced: true,
        mlPrediction: mlPrediction,
        riskScore: Math.max(riskAssessment.riskScore || 0, mlPrediction.riskScore),
        riskLevel: this._determineRiskLevel(Math.max(riskAssessment.riskScore || 0, mlPrediction.riskScore))
      };

      return enhancedRisk;
    } catch (error) {
      console.warn('ML enhancement failed:', error.message);
      return riskAssessment;
    }
  }

  /**
   * Enhance recommendations with ML predictions
   * @param {Array} existingRecommendations - Existing recommendations
   * @param {Array} classifiedFiles - Classified files
   * @returns {Array} Enhanced recommendations
   */
  enhanceRecommendations(existingRecommendations, classifiedFiles) {
    if (!this.isInitialized || !this.mlModel) {
      return existingRecommendations;
    }

    try {
      // Extract features for ML prediction
      const mlFeatures = this._extractMLFeatures(classifiedFiles);
      
      // Get ML prediction
      const mlPrediction = this.mlModel.predict(mlFeatures);
      
      // Add ML-specific recommendations
      const mlRecommendations = this._generateMLRecommendations(mlPrediction);
      
      return [...existingRecommendations, ...mlRecommendations];
    } catch (error) {
      console.warn('ML recommendation enhancement failed:', error.message);
      return existingRecommendations;
    }
  }

  /**
   * Extract features for ML prediction
   */
  _extractMLFeatures(classifiedFiles) {
    const features = {
      changeTypes: [],
      languages: [],
      totalFiles: classifiedFiles.length,
      totalAdditions: 0,
      totalDeletions: 0
    };

    classifiedFiles.forEach(file => {
      if (file.classification && file.classification.changeType) {
        features.changeTypes.push(file.classification.changeType);
      }
      
      // Extract language from file path
      const language = this._detectLanguage(file.newPath);
      if (language) {
        features.languages.push(language);
      }
      
      features.totalAdditions += file.additions || 0;
      features.totalDeletions += file.deletions || 0;
    });

    return features;
  }

  /**
   * Detect programming language from file path
   */
  _detectLanguage(filePath) {
    if (!filePath) return null;
    const ext = filePath.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go'
    };
    return languageMap[ext] || null;
  }

  /**
   * Generate ML-specific recommendations
   */
  _generateMLRecommendations(mlPrediction) {
    const recommendations = [];
    
    if (mlPrediction.recommendedChecks && Array.isArray(mlPrediction.recommendedChecks)) {
      mlPrediction.recommendedChecks.forEach(checkType => {
        recommendations.push({
          type: 'ml-enhanced',
          priority: 'medium',
          message: `ML-enhanced ${checkType} analysis recommended`,
          category: checkType,
          confidence: 0.8
        });
      });
    }
    
    return recommendations;
  }

  /**
   * Determine risk level based on score
   */
  _determineRiskLevel(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Check if ML integration is available
   */
  isAvailable() {
    return this.isInitialized && this.mlModel !== null;
  }
}

module.exports = MLIntegrator;