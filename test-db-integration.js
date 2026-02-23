const DiffAgent = require('./src/index');
const fs = require('fs');

async function testDatabaseIntegration() {
  console.log('🧪 Testing database integration...');
  
  try {
    // Create agent with memory database mode
    const agent = new DiffAgent({
      database: {
        enabled: true,
        mode: 'memory'
      },
      cache: {
        enabled: false
      }
    });
    
    // Test diff content
    const testDiff = `diff --git a/test.ts b/test.ts
index 1234567..89abcdef 100644
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,5 @@
+// New TypeScript file
+const x: any = 'test';
 function hello() {
-  console.log('hello');
+  console.log('hello world');
 }
`;
    
    console.log('🔍 Analyzing test diff...');
    const result = await agent.analyze(testDiff, { userId: 'test-user' });
    
    if (result.success) {
      console.log('✅ Analysis successful!');
      console.log('📊 Risk Score:', result.riskScore.riskScore);
      console.log('📋 Recommendations:', result.recommendations.length);
      
      // Test database retrieval
      console.log('💾 Testing database storage...');
      // For memory mode, we can access the data directly
      if (agent.db && agent.db.client) {
        const analysisCount = agent.db.client.analysisResults.size;
        const recCount = agent.db.client.recommendations.size;
        console.log(`📊 Stored ${analysisCount} analysis results and ${recCount} recommendations`);
        
        // Show stored data
        if (analysisCount > 0) {
          const firstAnalysis = agent.db.client.analysisResults.values().next().value;
          console.log('📝 First analysis result:', firstAnalysis.language, firstAnalysis.change_type);
        }
      }
      
      console.log('✅ Database integration test passed!');
    } else {
      console.log('❌ Analysis failed:', result.error);
    }
    
    // Cleanup
    await agent.close();
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseIntegration().catch(console.error);