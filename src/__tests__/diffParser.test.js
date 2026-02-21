const DiffParser = require('../diffParser');

describe('DiffParser', () => {
  test('should parse basic git diff', () => {
    const diff = `diff --git a/test.js b/test.js
index abc123..def456 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
 function hello() {
   console.log('Hello World');
+  console.log('New line');
 }
`;
    
    const parser = new DiffParser();
    const result = parser.parse(diff);
    
    expect(result).toBeDefined();
    expect(result.files).toHaveLength(1);
    expect(result.files[0].filename).toBe('test.js');
    expect(result.files[0].changes).toHaveLength(1);
    expect(result.files[0].changes[0].type).toBe('add');
  });

  test('should handle multiple files', () => {
    const diff = `diff --git a/file1.js b/file1.js
index abc123..def456 100644
--- a/file1.js
+++ b/file1.js
@@ -1,1 +1,2 @@
-// old
+// new
+console.log('added');

diff --git a/file2.py b/file2.py
index xyz789..uvw012 100644
--- a/file2.py
+++ b/file2.py
@@ -1,2 +1,1 @@
 def test():
-    pass
`;
    
    const parser = new DiffParser();
    const result = parser.parse(diff);
    
    expect(result.files).toHaveLength(2);
  });
});