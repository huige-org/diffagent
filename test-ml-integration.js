#!/usr/bin/env node

const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Read test diff
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

console.log('🚀 Starting ML Integration Test');
console.log('================================');

// Initialize DiffAgent with ML enabled
const agent = new DiffAgent({
  ml: {
    enabled: true,
    modelPath: './ml/model.js',
    trainingDataPath: './ml/training-data.json'
  }
});

try {
  // Analyze with ML enhancement
  const analysis = agent.analyze(diffContent);
  
  console.log('✅ Analysis completed successfully!');
  console.log(`📊 Files analyzed: ${analysis.files.length}`);
  console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
  console.log(`🤖 ML enhanced: ${analysis.mlEnhanced || false}`);
  
  if (analysis.mlPrediction) {
    console.log(`📈 ML Prediction:`);
    console.log(`   Risk Score: ${analysis.mlPrediction.riskScore}`);
    console.log(`   Risk Level: ${analysis.mlPrediction.riskLevel}`);
    console.log(`   Recommended Checks: ${analysis.mlPrediction.recommendedChecks.join(', ')}`);
  }
  
  console.log('\n🎉 ML Integration Test Completed!');
  console.log('================================');
  
} catch (error) {
  console.error('❌ ML Integration Test failed:', error.message);
  process.exit(1);
}