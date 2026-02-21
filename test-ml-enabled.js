const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Read test diff
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

// Create DiffAgent with ML enabled
const agent = new DiffAgent({ enableML: true });

// Analyze the diff
const analysis = agent.analyze(diffContent);

console.log('🚀 ML Enabled Integration Test');
console.log('================================');
if (analysis.success) {
  console.log('✅ Analysis completed successfully!');
  console.log(`📊 Files analyzed: ${analysis.files.length}`);
  console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
  console.log(`🤖 ML enhanced: ${analysis.mlEnhanced}`);
  
  if (analysis.recommendations.length > 0) {
    console.log('\n📋 Detailed Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
    });
  }
} else {
  console.log('❌ Analysis failed:', analysis.error);
}

console.log('\n🎉 ML Enabled Integration Test Completed!');
console.log('===========================================');