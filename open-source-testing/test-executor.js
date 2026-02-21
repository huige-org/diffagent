const fs = require('fs');
const path = require('path');
const DiffAgent = require('../src/diffAgent');

class TestExecutor {
  constructor() {
    this.testDataDir = path.join(__dirname, 'test-data');
    this.results = [];
  }

  async runTests() {
    console.log('🚀 Starting Open Source Project Tests');
    console.log('=====================================');
    
    // Load test projects
    const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));
    
    // Run tests for each language category
    for (const [language, projectList] of Object.entries(projects)) {
      console.log(`\n🔍 Testing ${language.toUpperCase()} projects:`);
      
      for (const project of projectList) {
        try {
          console.log(`  📦 ${project.name}: ${project.description}`);
          
          // Create mock diff based on project type
          const mockDiff = this.createMockDiff(language, project.name);
          const agent = new DiffAgent();
          const analysis = agent.analyze(mockDiff);
          
          if (analysis.success) {
            const result = {
              project: project.name,
              language: language,
              files_analyzed: analysis.files.length,
              recommendations_count: analysis.recommendations.length,
              risk_level: analysis.summary?.riskLevel || 'unknown',
              timestamp: new Date().toISOString()
            };
            this.results.push(result);
            console.log(`    ✅ Analysis completed: ${result.files_analyzed} files, ${result.recommendations_count} recommendations`);
          } else {
            console.log(`    ❌ Analysis failed: ${analysis.error}`);
          }
        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
        }
      }
    }
    
    // Save results
    fs.writeFileSync(path.join(__dirname, 'ml-training-data.json'), JSON.stringify(this.results, null, 2));
    console.log(`\n📊 Test Results Summary:`);
    console.log(`=======================`);
    console.log(`Total Projects Tested: ${this.results.length}`);
    console.log(`Successful Analyses: ${this.results.filter(r => r.files_analyzed > 0).length}`);
    
    return this.results;
  }

  createMockDiff(language, projectName) {
    // Create language-specific mock diffs
    const mocks = {
      javascript: `diff --git a/src/${projectName}.js b/src/${projectName}.js
--- a/src/${projectName}.js
+++ b/src/${projectName}.js
@@ -1,5 +1,8 @@
 function calculateTotal(items) {
-  return items.reduce((sum, item) => sum + item.price, 0);
+  if (!items || items.length === 0) {
+    return 0;
+  }
+  return items.reduce((sum, item) => sum + (item.price || 0), 0);
 }
 
 function formatDate(date) {
@@ -10,3 +13,7 @@ function formatDate(date) {
   return date.toISOString().split('T')[0];
 }
 
+function validateEmail(email) {
+  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
+  return regex.test(email);
+}`,
      
      python: `diff --git a/src/${projectName}.py b/src/${projectName}.py
--- a/src/${projectName}.py
+++ b/src/${projectName}.py
@@ -1,3 +1,8 @@
 def calculate_total(items):
-    return sum(item['price'] for item in items)
+    if not items or len(items) == 0:
+        return 0
+    return sum(item.get('price', 0) for item in items)
+
+def validate_email(email):
+    import re
+    pattern = r'^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
+    return re.match(pattern, email) is not None`,
      
      java: `diff --git a/src/${projectName}.java b/src/${projectName}.java
--- a/src/${projectName}.java
+++ b/src/${projectName}.java
@@ -1,5 +1,12 @@
 public class ${projectName} {
     public int add(int a, int b) {
         return a + b;
     }
+    
+    public double divide(double a, double b) {
+        if (b == 0) {
+            throw new IllegalArgumentException("Division by zero");
+        }
+        return a / b;
+    }
 }`,
      
      go: `diff --git a/src/${projectName}.go b/src/${projectName}.go
--- a/src/${projectName}.go
+++ b/src/${projectName}.go
@@ -1,5 +1,10 @@
 package main
 
 func Add(a, b int) int {
     return a + b
 }
+
+func Divide(a, b float64) (float64, error) {
+    if b == 0 {
+        return 0, fmt.Errorf("division by zero")
+    }
+    return a / b, nil
+}`
    };
    
    return mocks[language] || mocks.javascript;
  }
}

module.exports = TestExecutor;