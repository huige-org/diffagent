const fs = require('fs');
const path = require('path');

// Load test data
const testData = [
  {
    project: "react",
    language: "javascript", 
    changeType: "bug_fix",
    files: 3,
    additions: 15,
    deletions: 5,
    securityIssues: 0,
    performanceIssues: 1,
    qualityIssues: 2,
    testIssues: 1,
    riskScore: 0.4
  },
  {
    project: "vue", 
    language: "javascript",
    changeType: "feature",
    files: 2,
    additions: 25,
    deletions: 3,
    securityIssues: 1,
    performanceIssues: 0,
    qualityIssues: 1,
    testIssues: 2,
    riskScore: 0.6
  },
  {
    project: "django",
    language: "python",
    changeType: "security_fix", 
    files: 1,
    additions: 8,
    deletions: 2,
    securityIssues: 3,
    performanceIssues: 0,
    qualityIssues: 0,
    testIssues: 1,
    riskScore: 0.8
  },
  {
    project: "flask",
    language: "python",
    changeType: "refactor",
    files: 4,
    additions: 12,
    deletions: 18,
    securityIssues: 0,
    performanceIssues: 2,
    qualityIssues: 3,
    testIssues: 0,
    riskScore: 0.3
  },
  {
    project: "spring-boot",
    language: "java",
    changeType: "performance_optimization",
    files: 2,
    additions: 20,
    deletions: 5,
    securityIssues: 0,
    performanceIssues: 4,
    qualityIssues: 1,
    testIssues: 1,
    riskScore: 0.5
  }
];

// Save training data
const outputPath = path.join(__dirname, 'training-data.json');
fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));

console.log(`✅ Saved ${testData.length} training samples to ${outputPath}`);