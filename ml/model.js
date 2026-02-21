/**
 * ML Model for DiffAgent - Simplified version using statistical learning
 * This model uses collected data to improve classification and recommendations
 */

class MLModel {
  constructor(config = {}) {
    this.config = {
      learningRate: config.learningRate || 0.1,
      maxIterations: config.maxIterations || 100,
      ...config
    };
    
    // Initialize weights for different recommendation types
    this.weights = {
      security: 0.5,
      performance: 0.5,
      quality: 0.5,
      test: 0.5
    };
    
    this.trainingData = [];
    this.isTrained = false;
  }

  /**
   * Train the model with collected data
   * @param {Array} data - Training data from open source projects
   */
  train(data) {
    console.log('🚀 Starting model training with', data.length, 'samples...');
    
    if (data.length === 0) {
      console.warn('⚠️  No training data available');
      return;
    }
    
    this.trainingData = data;
    
    // Simple statistical learning - adjust weights based on data
    const featureCounts = {
      security: 0,
      performance: 0,
      quality: 0,
      test: 0
    };
    
    // Count features in training data
    data.forEach(sample => {
      if (sample.recommendations_count > 0) {
        // Simple heuristic: more recommendations = higher weight
        const language = sample.language;
        switch (language) {
          case 'javascript':
            featureCounts.quality += sample.recommendations_count;
            featureCounts.security += Math.floor(sample.recommendations_count / 2);
            break;
          case 'python':
            featureCounts.test += sample.recommendations_count;
            featureCounts.quality += Math.floor(sample.recommendations_count / 2);
            break;
          case 'java':
            featureCounts.security += sample.recommendations_count;
            featureCounts.performance += Math.floor(sample.recommendations_count / 2);
            break;
          case 'go':
            featureCounts.performance += sample.recommendations_count;
            featureCounts.test += Math.floor(sample.recommendations_count / 2);
            break;
        }
      }
    });
    
    // Normalize weights
    const total = Object.values(featureCounts).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
      this.weights.security = Math.min(0.9, featureCounts.security / total + 0.3);
      this.weights.performance = Math.min(0.9, featureCounts.performance / total + 0.3);
      this.weights.quality = Math.min(0.9, featureCounts.quality / total + 0.3);
      this.weights.test = Math.min(0.9, featureCounts.test / total + 0.3);
    }
    
    this.isTrained = true;
    console.log('📊 Updated weights:', this.weights);
    console.log('✅ Model training completed!');
  }

  /**
   * Predict risk score and recommendations for a file
   * @param {Object} fileAnalysis - File analysis result
   * @returns {Object} Prediction result
   */
  predict(fileAnalysis) {
    if (!this.isTrained) {
      // Return default prediction if not trained
      return {
        riskScore: 0.5,
        riskLevel: 'medium',
        recommendedChecks: ['quality', 'security', 'test']
      };
    }
    
    const language = this._detectLanguage(fileAnalysis.newPath);
    const content = fileAnalysis.content || '';
    const additions = fileAnalysis.additions || 0;
    const deletions = fileAnalysis.deletions || 0;
    
    // Calculate base risk score
    let riskScore = 0.3; // Base risk
    
    // Adjust based on language-specific weights
    switch (language) {
      case 'javascript':
        riskScore += this.weights.security * 0.2;
        riskScore += this.weights.quality * 0.15;
        break;
      case 'python':
        riskScore += this.weights.test * 0.2;
        riskScore += this.weights.quality * 0.15;
        break;
      case 'java':
        riskScore += this.weights.security * 0.25;
        riskScore += this.weights.performance * 0.1;
        break;
      case 'go':
        riskScore += this.weights.performance * 0.2;
        riskScore += this.weights.test * 0.15;
        break;
    }
    
    // Adjust based on change size
    const totalChanges = additions + deletions;
    if (totalChanges > 10) {
      riskScore += 0.1;
    }
    if (totalChanges > 50) {
      riskScore += 0.15;
    }
    
    // Adjust based on content patterns
    if (content.includes('eval(') || content.includes('innerHTML')) {
      riskScore += this.weights.security * 0.3;
    }
    if (content.includes('console.log') || content.includes('debugger')) {
      riskScore += this.weights.quality * 0.1;
    }
    if (content.includes('TODO') || content.includes('FIXME')) {
      riskScore += this.weights.quality * 0.15;
    }
    
    // Cap risk score
    riskScore = Math.min(1.0, riskScore);
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore > 0.7) {
      riskLevel = 'high';
    } else if (riskScore > 0.4) {
      riskLevel = 'medium';
    }
    
    // Determine recommended checks
    const recommendedChecks = [];
    const threshold = 0.6;
    
    if (this.weights.security > threshold) {
      recommendedChecks.push('security');
    }
    if (this.weights.performance > threshold) {
      recommendedChecks.push('performance');
    }
    if (this.weights.quality > threshold) {
      recommendedChecks.push('quality');
    }
    if (this.weights.test > threshold) {
      recommendedChecks.push('test');
    }
    
    // Ensure at least some checks are recommended
    if (recommendedChecks.length === 0) {
      recommendedChecks.push('quality', 'security');
    }
    
    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      recommendedChecks
    };
  }

  /**
   * Detect programming language from file path
   */
  _detectLanguage(filePath) {
    if (!filePath) return 'unknown';
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
    return languageMap[ext] || 'unknown';
  }

  /**
   * Get model statistics
   */
  getStats() {
    return {
      isTrained: this.isTrained,
      trainingSamples: this.trainingData.length,
      weights: { ...this.weights }
    };
  }
}

module.exports = MLModel;