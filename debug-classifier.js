const fs = require('fs');
const DiffParser = require('./src/diffParser');
const ChangeClassifier = require('./src/changeClassifier');

// Read test diff
const diffContent = fs.readFileSync('./examples/test-diff.txt', 'utf8');

// Parse diff
const parser = new DiffParser();
const parsedDiff = parser.parse(diffContent);
console.log('Parsed Diff:', JSON.stringify(parsedDiff, null, 2));

// Classify changes
const classifier = new ChangeClassifier();
const classifiedFiles = parsedDiff.files.map(file => {
  return classifier.classifyFile(file);
});
console.log('Classified Files:', JSON.stringify(classifiedFiles, null, 2));