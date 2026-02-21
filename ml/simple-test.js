#!/usr/bin/env node

console.log('🚀 Starting Simplified ML Model Test');
console.log('===============================');

// Test data collector
const DataCollector = require('./data-collector');
const collector = new DataCollector();
const trainingData = collector.collectTrainingData();
console.log(`📊 Collected ${trainingData.length} training samples`);

// Test feature extractor  
const FeatureExtractor = require('./feature-extractor');
const features = trainingData.map(sample => FeatureExtractor.extractFeatures(sample));
console.log(`✅ Extracted features for ${features.length} samples`);

// Test model
const MLModel = require('./model');
const model = new MLModel();
model.train(features);
console.log('✅ Model training completed!');

// Test prediction
const testSample = { language: 'javascript', fileCount: 2, changeType: 'bug_fix' };
const prediction = model.predict(testSample);
console.log(`🎯 Prediction: ${JSON.stringify(prediction, null, 2)}`);

console.log('🎉 Simplified ML Model Test Completed!');
console.log('=====================================');