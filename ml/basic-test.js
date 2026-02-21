#!/usr/bin/env node

console.log('🚀 Starting Basic ML Model Test');
console.log('==============================');

// Simple ML model simulation
const mlModel = {
  weights: {
    security: 0.5,
    performance: 0.5, 
    quality: 0.5,
    test: 0.5
  },
  
  predict: function(features) {
    // Simple weighted prediction
    const riskScore = (features.security * this.weights.security + 
                      features.performance * this.weights.performance +
                      features.quality * this.weights.quality + 
                      features.test * this.weights.test) / 4;
    
    let riskLevel = 'low';
    if (riskScore > 0.7) riskLevel = 'high';
    else if (riskScore > 0.4) riskLevel = 'medium';
    
    return {
      riskScore: riskScore,
      riskLevel: riskLevel,
      recommendedChecks: ['security', 'quality']
    };
  },
  
  train: function(trainingData) {
    console.log('📈 Training model with', trainingData.length, 'samples...');
    // In a real implementation, this would update weights based on training data
    console.log('📊 Updated weights:', this.weights);
    console.log('✅ Model training completed!');
  }
};

// Test data
const testData = [
  { security: 1, performance: 0, quality: 1, test: 0 },
  { security: 0, performance: 1, quality: 1, test: 1 },
  { security: 1, performance: 1, quality: 0, test: 1 }
];

console.log('📊 Training with test data...');
mlModel.train(testData);

console.log('🎯 Testing predictions...');
const prediction = mlModel.predict({ security: 1, performance: 0, quality: 1, test: 0 });
console.log('🎯 Prediction:', JSON.stringify(prediction, null, 2));

console.log('🎉 Basic ML Model Test Completed!');
console.log('==================================');