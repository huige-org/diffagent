const DiffAgent = require('./src/index.js');

// Test with memory database
const config = {
  database: {
    mode: 'memory'
  }
};

const agent = new DiffAgent(config);

// Test diff content
const testDiff = `diff --git a/test.ts b/test.ts
index 1234567..89abcde 100644
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,5 @@
 function hello(name: string): any {
+  console.log('Hello ' + name);
   return 'Hello ' + name;
 }
`;

console.log('🧪 Testing memory database integration...');
try {
  const result = agent.analyze(testDiff);
  console.log('✅ Analysis completed successfully');
  console.log('📊 Risk Score:', result.riskScore.riskScore);
  console.log('📋 Recommendations:', result.recommendations.length);
  
  // Test database storage
  const db = require('./src/database/db');
  if (db.isInitialized()) {
    console.log('✅ Database integration working');
  } else {
    console.log('⚠️  Database not initialized');
  }
} catch (error) {
  console.error('❌ Test failed:', error.message);
}