#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const DataCollector = require('./data-collector');
const FeatureExtractor = require('./feature-extractor');
const MLModel = require('./model');

async function main() {
  console.log('🚀 Starting ML Model Training');
  console.log('=============================');
  
  try {
    // Step 1: Load training data
    console.log('📊 Loading training data...');
    const trainingDataPath = path.join(__dirname, 'training-data.json');
    let trainingData = [];
    
    if (fs.existsSync(trainingDataPath)) {
      const rawData = fs.readFileSync(trainingDataPath, 'utf8');
      trainingData = JSON.parse(rawData);
      console.log(`✅ Loaded ${trainingData.length} training samples`);
    } else {
      console.log('⚠️  No training data found, creating synthetic data...');
      trainingData = createSyntheticTrainingData();
      console.log(`✅ Created ${trainingData.length} synthetic samples`);
    }
    
    // Step 2: Extract features
    console.log('🧠 Extracting features...');
    const featureExtractor = new FeatureExtractor();
    const features = trainingData.map(sample => 
      featureExtractor.extractFeatures(sample)
    );
    console.log(`✅ Extracted features for ${features.length} samples`);
    
    // Step 3: Initialize and train model
    console.log('📈 Training ML model...');
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    const model = new MLModel(config);
    
    await model.train(features, trainingData);
    console.log('✅ Model training completed!');
    
    // Step 4: Save trained model
    console.log('💾 Saving trained model...');
    const modelPath = path.join(__dirname, 'trained-model.json');
    fs.writeFileSync(modelPath, JSON.stringify(model.getModelWeights(), null, 2));
    console.log(`✅ Model saved to ${modelPath}`);
    
    // Step 5: Test the model
    console.log('🔍 Testing trained model...');
    const testSample = features[0] || createTestSample();
    const prediction = model.predict(testSample);
    console.log(`🎯 Prediction: ${JSON.stringify(prediction, null, 2)}`);
    
    console.log('\n🎉 ML Model Training Completed!');
    console.log('==============================');
    
  } catch (error) {
    console.error('❌ Error during training:', error.message);
    process.exit(1);
  }
}

function createSyntheticTrainingData() {
  return [
    {
      project: 'react',
      language: 'javascript',
      files: 5,
      additions: 120,
      deletions: 45,
      changeType: 'feature',
      riskScore: 0.6,
      recommendations: ['security', 'test', 'quality']
    },
    {
      project: 'django',
      language: 'python',
      files: 3,
      additions: 80,
      deletions: 20,
      changeType: 'bug_fix',
      riskScore: 0.4,
      recommendations: ['test', 'quality']
    },
    {
      project: 'spring-boot',
      language: 'java',
      files: 7,
      additions: 200,
      deletions: 150,
      changeType: 'refactor',
      riskScore: 0.7,
      recommendations: ['performance', 'test', 'security']
    }
  ];
}

function createTestSample() {
  return {
    language_javascript: 1,
    language_python: 0,
    language_java: 0,
    language_go: 0,
    files_count: 5,
    additions_count: 120,
    deletions_count: 45,
    change_type_feature: 1,
    change_type_bug_fix: 0,
    change_type_refactor: 0,
    change_type_security_fix: 0
  };
}

if (require.main === module) {
  main();
}