#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load training data
const trainingDataPath = path.join(__dirname, 'training-data.json');
const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'));

console.log('📊 Training Data:');
console.log(JSON.stringify(trainingData, null, 2));

// Simple ML model
class SimpleMLModel {
  constructor() {
    this.weights = {
      security: 0.5,
      performance: 0.5,
      quality: 0.5,
      test: 0.5
    };
  }

  train(data) {
    console.log('📈 Training with data:', data.length);
    
    // Count occurrences of each type
    const typeCounts = {};
    data.forEach(sample => {
      const type = sample.changeType || 'other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    console.log('📊 Type counts:', typeCounts);

    // Adjust weights based on data
    if (typeCounts.bug_fix > 0) {
      this.weights.security = 0.8;
      this.weights.test = 0.7;
    }
    if (typeCounts.feature > 0) {
      this.weights.quality = 0.6;
      this.weights.test = 0.7;
    }
    if (typeCounts.performance_optimization > 0) {
      this.weights.performance = 0.9;
    }

    console.log('✅ Updated weights:', this.weights);
  }

  predict(features) {
    console.log('🔍 Predicting with features:', features);
    
    let riskScore = 0;
    let totalWeight = 0;
    const recommendedChecks = [];

    // Calculate risk score
    if (features.changeType === 'bug_fix') {
      riskScore += this.weights.security * 0.3;
      riskScore += this.weights.test * 0.4;
      recommendedChecks.push('security', 'test');
    } else if (features.changeType === 'feature') {
      riskScore += this.weights.quality * 0.2;
      riskScore += this.weights.test * 0.3;
      recommendedChecks.push('quality', 'test');
    } else if (features.changeType === 'performance_optimization') {
      riskScore += this.weights.performance * 0.5;
      recommendedChecks.push('performance');
    } else {
      riskScore = 0.1;
      recommendedChecks.push('quality');
    }

    const riskLevel = riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low';

    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      recommendedChecks: [...new Set(recommendedChecks)]
    };
  }
}

// Test the model
const model = new SimpleMLModel();
model.train(trainingData);

// Test predictions
const testCases = [
  { changeType: 'bug_fix' },
  { changeType: 'feature' },
  { changeType: 'performance_optimization' },
  { changeType: 'other' }
];

console.log('\n🎯 Test Predictions:');
testCases.forEach(testCase => {
  const prediction = model.predict(testCase);
  console.log(`${testCase.changeType}:`, prediction);
});