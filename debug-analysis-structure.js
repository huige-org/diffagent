const fs = require('fs');
const DiffAgent = require('./src/diffAgent');

// Read test data
const diffContent = fs.readFileSync('./examples/multi-language-diff.txt', 'utf8');

// Create DiffAgent instance with ML enabled
const config = {
  ml: {
    enabled: true,
    modelPath: './ml/model.js',
    trainingDataPath: './ml/training-data.json'
  }
};
const agent = new DiffAgent(config);

// Analyze
const analysis = agent.analyze(diffContent);

console.log('🔍 Analysis Structure:');
console.log('Success:', analysis.success);
console.log('Error:', analysis.error);
console.log('Files count:', analysis.files ? analysis.files.length : 'undefined');
console.log('Change Types:', analysis.changeTypes);
console.log('Risk Score:', analysis.riskScore);
console.log('Recommendations count:', analysis.recommendations ? analysis.recommendations.length : 'undefined');

if (analysis.files && analysis.files.length > 0) {
  console.log('\n📄 First file structure:');
  console.log('Keys:', Object.keys(analysis.files[0]));
  if (analysis.files[0].classification) {
    console.log('Classification:', analysis.files[0].classification);
  }
}