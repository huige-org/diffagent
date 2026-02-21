const RecommendationGenerator = require('./src/recommendationGenerator');

// Test data
const testAnalysis = {
  files: [
    {
      classification: { changeType: 'bug_fix' }
    },
    {
      classification: { changeType: 'bug_fix' }
    },
    {
      classification: { changeType: 'feature' }
    }
  ],
  riskScore: 0.3,
  changeTypes: { bug_fix: 2, feature: 1 }
};

const generator = new RecommendationGenerator();
const recommendations = generator.generateRecommendations(testAnalysis);

console.log('Test Analysis:', testAnalysis);
console.log('Recommendations count:', recommendations.length);
console.log('Recommendations:', recommendations);