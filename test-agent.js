const fs = require('fs');
const path = require('path');
const DiffAgent = require('./src');

// Read test diff
const diffContent = fs.readFileSync(path.join(__dirname, 'examples', 'test-diff.txt'), 'utf8');

// Initialize agent
const agent = new DiffAgent();

// Analyze diff
const result = agent.analyze(diffContent);

// Output results
console.log('=== DiffAgent Analysis Results ===');
console.log('Summary:', result.summary);
console.log('Risk Score:', result.riskScore);
console.log('Change Types:', result.changeTypes);
console.log('Files Analyzed:', Object.keys(result.files).length);
console.log('\nDetailed Analysis:');
console.log(JSON.stringify(result, null, 2));