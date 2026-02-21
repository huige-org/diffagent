const { DiffAnalyzer } = require('../analyzer/diffAnalyzer');

describe('DiffAnalyzer', () => {
  test('should analyze a simple diff', () => {
    const mockDiff = `diff --git a/test.js b/test.js
index abc123..def456 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
 function hello() {
-  console.log('Hello');
+  console.log('Hello World');
 }
+// New comment`;

    const analyzer = new DiffAnalyzer();
    const result = analyzer.analyze(mockDiff);
    
    expect(result).toHaveProperty('files');
    expect(result.files[0].additions).toBe(2);
    expect(result.files[0].deletions).toBe(1);
  });
});