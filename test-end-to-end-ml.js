const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Load test configuration
const config = {
  enableML: true,
  ml: {
    enabled: true,
    trainingDataPath: './ml/training-data.json'
  }
};

// Read test diff
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

// Initialize DiffAgent with ML config
const agent = new DiffAgent(config);

// Analyze the diff
const analysis = agent.analyze(diffContent);

// Output results
console.log('🚀 End-to-End ML Integration Test');
console.log('================================');
if (analysis.success) {
  console.log('✅ Analysis completed successfully!');
  console.log('📊 Files analyzed:', analysis.files.length);
  console.log('💡 Recommendations:', analysis.recommendations.length);
  console.log('🤖 ML enhanced:', analysis.mlEnhanced);
  
  console.log('\n📋 Detailed Recommendations:');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
  });
  
  console.log('\n🧠 ML Enhancement Details:');
  console.log('📈 Risk Score:', analysis.riskScore.riskScore);
  console.log('🏷️  Risk Level:', analysis.riskScore.riskLevel);
  
  console.log('\n🎉 End-to-End ML Integration Test Completed!');
  console.log('===========================================');
} else {
  console.error('❌ Analysis failed:', analysis.error);
}