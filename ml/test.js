#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const DataCollector = require('./data-collector');
const FeatureExtractor = require('./feature-extractor');
const MLModel = require('./model');
const Integrator = require('./integrator');

async function runMLTest() {
  console.log('🚀 Starting ML Model Test');
  console.log('=========================');
  
  try {
    // Load configuration
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    
    // Initialize components
    const dataCollector = new DataCollector(config);
    const featureExtractor = new FeatureExtractor(config);
    const mlModel = new MLModel(config);
    const integrator = new Integrator(config);
    
    // Test data collection
    console.log('📊 Collecting training data...');
    const trainingData = await dataCollector.collectTrainingData();
    console.log(`✅ Collected ${trainingData.length} training samples`);
    
    // Test feature extraction
    console.log('🔍 Extracting features...');
    const features = trainingData.map(sample => featureExtractor.extractFeatures(sample));
    console.log(`✅ Extracted features for ${features.length} samples`);
    
    // Test model training
    console.log('📈 Training ML model...');
    await mlModel.train(features, trainingData);
    console.log('✅ Model training completed!');
    
    // Test prediction
    console.log('🎯 Testing predictions...');
    const testSample = features[0] || { riskScore: 0.5, language: 'javascript' };
    const prediction = mlModel.predict(testSample);
    console.log(`🎯 Prediction: ${JSON.stringify(prediction, null, 2)}`);
    
    // Test integration
    console.log('🧪 Testing DiffAgent integration...');
    const integrationResult = await integrator.integrateWithDiffAgent(prediction);
    console.log(`✅ Integration result: ${JSON.stringify(integrationResult, null, 2)}`);
    
    console.log('🎉 ML Model Test Completed!');
    console.log('===========================');
    
  } catch (error) {
    console.error('❌ ML Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runMLTest().catch(console.error);
}

module.exports = { runMLTest };