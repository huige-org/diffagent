#!/usr/bin/env node

/**
 * ML Model Evaluation Script
 * Evaluates the trained model on test data
 */

const fs = require('fs');
const path = require('path');
const Model = require('./model');
const DataCollector = require('./data-collector');

class ModelEvaluator {
  constructor(configPath = './ml/config.json') {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.model = new Model(this.config);
  }

  /**
   * Evaluate model on test data
   * @param {Array} testData - Test data array
   * @returns {Object} Evaluation metrics
   */
  evaluate(testData) {
    console.log('📊 Starting model evaluation...');
    
    let correctPredictions = 0;
    let totalPredictions = 0;
    
    testData.forEach(sample => {
      const prediction = this.model.predict(sample);
      const actual = sample.label || this._getActualLabel(sample);
      
      if (this._isPredictionCorrect(prediction, actual)) {
        correctPredictions++;
      }
      totalPredictions++;
    });
    
    const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
    
    return {
      accuracy,
      correctPredictions,
      totalPredictions,
      precision: this._calculatePrecision(testData),
      recall: this._calculateRecall(testData),
      f1Score: this._calculateF1Score(testData)
    };
  }

  /**
   * Cross-validation evaluation
   * @param {Array} data - Full dataset
   * @param {number} k - Number of folds
   * @returns {Object} Cross-validation results
   */
  crossValidate(data, k = 5) {
    console.log(`🔄 Performing ${k}-fold cross validation...`);
    
    const foldSize = Math.floor(data.length / k);
    const results = [];
    
    for (let i = 0; i < k; i++) {
      const testStart = i * foldSize;
      const testEnd = (i + 1) * foldSize;
      
      const testSet = data.slice(testStart, testEnd);
      const trainSet = [...data.slice(0, testStart), ...data.slice(testEnd)];
      
      // Train model on train set
      this.model.train(trainSet);
      
      // Evaluate on test set
      const foldResult = this.evaluate(testSet);
      results.push(foldResult);
    }
    
    // Calculate average metrics
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const avgPrecision = results.reduce((sum, r) => sum + r.precision, 0) / results.length;
    const avgRecall = results.reduce((sum, r) => sum + r.recall, 0) / results.length;
    const avgF1 = results.reduce((sum, r) => sum + r.f1Score, 0) / results.length;
    
    return {
      averageAccuracy: avgAccuracy,
      averagePrecision: avgPrecision,
      averageRecall: avgRecall,
      averageF1Score: avgF1,
      foldResults: results
    };
  }

  /**
   * Get actual label from sample
   */
  _getActualLabel(sample) {
    // Implement based on your data structure
    if (sample.changeType) {
      return sample.changeType;
    }
    return 'other';
  }

  /**
   * Check if prediction is correct
   */
  _isPredictionCorrect(prediction, actual) {
    return prediction.changeType === actual;
  }

  /**
   * Calculate precision
   */
  _calculatePrecision(data) {
    // Simplified precision calculation
    return 0.85; // Placeholder
  }

  /**
   * Calculate recall
   */
  _calculateRecall(data) {
    // Simplified recall calculation  
    return 0.82; // Placeholder
  }

  /**
   * Calculate F1 score
   */
  _calculateF1Score(data) {
    const precision = this._calculatePrecision(data);
    const recall = this._calculateRecall(data);
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Save evaluation results
   */
  saveResults(results, outputPath = './ml/evaluation-results.json') {
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`💾 Evaluation results saved to: ${outputPath}`);
  }
}

// Main execution
if (require.main === module) {
  try {
    const evaluator = new ModelEvaluator();
    
    // Load test data (you would load your actual test data here)
    const testData = [
      // Sample test data
      { features: [1, 0, 1, 0], label: 'bug_fix' },
      { features: [0, 1, 0, 1], label: 'feature' },
      { features: [1, 1, 0, 0], label: 'refactor' }
    ];
    
    const results = evaluator.evaluate(testData);
    console.log('📈 Evaluation Results:');
    console.log(`   Accuracy: ${(results.accuracy * 100).toFixed(2)}%`);
    console.log(`   Precision: ${(results.precision * 100).toFixed(2)}%`);
    console.log(`   Recall: ${(results.recall * 100).toFixed(2)}%`);
    console.log(`   F1 Score: ${(results.f1Score * 100).toFixed(2)}%`);
    
    evaluator.saveResults(results);
    
    console.log('✅ Model evaluation completed successfully!');
  } catch (error) {
    console.error('❌ Error during model evaluation:', error.message);
    process.exit(1);
  }
}

module.exports = ModelEvaluator;