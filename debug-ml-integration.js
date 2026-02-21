const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Read test diff
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

// Initialize DiffAgent with ML enabled
const agent = new DiffAgent({
  ml: {
    enabled: true,
    modelPath: './ml/model.js',
    trainingDataPath: './ml/training-data.json'
  }
});

console.log('🔍 Starting ML Integration Debug...');
console.log('📊 Config:', agent.config);

try {
  const analysis = agent.analyze(diffContent);
  console.log('✅ Analysis completed!');
  console.log('📊 Files analyzed:', analysis.files.length);
  console.log('💡 Recommendations:', analysis.recommendations.length);
  console.log('🤖 ML enhanced:', analysis.mlEnhanced);
  console.log('📈 Risk Score:', analysis.riskScore);
  
  if (analysis.recommendations.length > 0) {
    console.log('📋 First recommendation:', analysis.recommendations[0]);
  }
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
  console.error('Stack:', error.stack);
}