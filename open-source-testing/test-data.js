// Test data for ML training
const testData = [
  {
    project: 'react',
    language: 'javascript',
    changeType: 'bug_fix',
    filesChanged: 3,
    linesAdded: 45,
    linesDeleted: 12,
    securityIssues: 0,
    performanceIssues: 1,
    qualityIssues: 2,
    testCoverage: 0.8,
    riskScore: 0.3
  },
  {
    project: 'vue',
    language: 'javascript', 
    changeType: 'feature',
    filesChanged: 5,
    linesAdded: 120,
    linesDeleted: 8,
    securityIssues: 1,
    performanceIssues: 2,
    qualityIssues: 3,
    testCoverage: 0.6,
    riskScore: 0.7
  },
  {
    project: 'django',
    language: 'python',
    changeType: 'refactor',
    filesChanged: 2,
    linesAdded: 25,
    linesDeleted: 30,
    securityIssues: 0,
    performanceIssues: 0,
    qualityIssues: 1,
    testCoverage: 0.9,
    riskScore: 0.2
  },
  {
    project: 'flask',
    language: 'python',
    changeType: 'security_fix',
    filesChanged: 1,
    linesAdded: 15,
    linesDeleted: 5,
    securityIssues: 2,
    performanceIssues: 0,
    qualityIssues: 1,
    testCoverage: 0.7,
    riskScore: 0.8
  },
  {
    project: 'spring-boot',
    language: 'java',
    changeType: 'performance_optimization',
    filesChanged: 4,
    linesAdded: 80,
    linesDeleted: 25,
    securityIssues: 0,
    performanceIssues: 3,
    qualityIssues: 2,
    testCoverage: 0.5,
    riskScore: 0.6
  }
];

module.exports = testData;