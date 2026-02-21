#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the updated model
const Model = require('./model');
const trainingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'training-data.json'), 'utf8'));

console.log('🚀 Starting Enhanced ML Model Test');
console.log('=================================');

// Initialize and train model with new data
console.log('📊 Training with enhanced data...');
const model = new Model();
model.train(trainingData);
console.log('✅ Model training completed!');

// Test predictions
console.log('🎯 Testing predictions...');
const testSample = {
  language: 'javascript',
  changeType: 'bug_fix',
  filesChanged: 3,
  securityPatterns: 1,
  performancePatterns: 0,
  qualityPatterns: 2,
  testPatterns: 1
};

const prediction = model.predict(testSample);
console.log('🎯 Prediction:', JSON.stringify(prediction, null, 2));

// Test with different scenarios
console.log('\n🧪 Testing different scenarios...');

const scenarios = [
  {
    name: 'Security Fix',
    data: {
      language: 'python',
      changeType: 'security_fix',
      filesChanged: 1,
      securityPatterns: 5,
      performancePatterns: 0,
      qualityPatterns: 1,
      testPatterns: 2
    }
  },
  {
    name: 'Performance Optimization',
    data: {
      language: 'java',
      changeType: 'performance_optimization',
      filesChanged: 2,
      securityPatterns: 0,
      performancePatterns: 4,
      qualityPatterns: 1,
      testPatterns: 1
    }
  },
  {
    name: 'Feature Addition',
    data: {
      language: 'go',
      changeType: 'feature',
      filesChanged: 5,
      securityPatterns: 1,
      performancePatterns: 2,
      qualityPatterns: 3,
      testPatterns: 0
    }
  }
];

scenarios.forEach(scenario => {
  const pred = model.predict(scenario.data);
  console.log(`\n📈 ${scenario.name}:`);
  console.log(`   Risk Score: ${pred.riskScore.toFixed(2)}`);
  console.log(`   Risk Level: ${pred.riskLevel}`);
  console.log(`   Recommended Checks: ${pred.recommendedChecks.join(', ')}`);
});

console.log('\n🎉 Enhanced ML Model Test Completed!');
console.log('=====================================');