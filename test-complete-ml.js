const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Enable ML in config
const config = {
  enableML: true,
  ml: {
    enabled: true,
    modelPath: './ml/model.js',
    trainingDataPath: './ml/training-data.json'
  }
};

// Read test diff
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

// Create DiffAgent instance with ML config
const agent = new DiffAgent(config);

// Analyze the diff
const analysis = agent.analyze(diffContent);

// Output results
console.log('🚀 Complete ML Integration Test');
console.log('================================');
console.log('✅ Analysis completed successfully!');
console.log('📊 Files analyzed:', analysis.files.length);
console.log('💡 Recommendations:', analysis.recommendations.length);
console.log('🤖 ML enhanced:', analysis.mlEnhanced);

if (analysis.recommendations.length > 0) {
  console.log('\n📋 Detailed Recommendations:');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
  });
}

if (analysis.mlEnhanced) {
  console.log('\n🧠 ML Enhancement Active!');
  console.log('📈 Risk Score:', analysis.riskScore.riskScore);
  console.log('🏷️  Risk Level:', analysis.riskScore.riskLevel);
}

console.log('\n🎉 Complete ML Integration Test Completed!');
console.log('===========================================');