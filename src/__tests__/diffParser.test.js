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
    expect(result.files[0].newPath).toBe('test.js');
    expect(result.files[0].additions).toBe(1);
    expect(result.files[0].deletions).toBe(0);
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
    expect(result.files[0].newPath).toBe('file1.js');
    expect(result.files[1].newPath).toBe('file2.py');
  });

  test('should handle file deletions', () => {
    const diff = `diff --git a/deleted.js b/deleted.js
deleted file mode 100644
index abc123..000000 100644
--- a/deleted.js
+++ /dev/null
@@ -1,3 +0,0 @@
-function deleted() {
-  console.log('This file was deleted');
-}
`;
    
    const parser = new DiffParser();
    const result = parser.parse(diff);
    
    expect(result.files).toHaveLength(1);
    expect(result.files[0].status).toBe('deleted');
    expect(result.files[0].newPath).toBe('/dev/null');
  });

  test('should handle new files', () => {
    const diff = `diff --git a/newfile.ts b/newfile.ts
new file mode 100644
index 000000..abc123 100644
--- /dev/null
+++ b/newfile.ts
@@ -0,0 +1,3 @@
+// New TypeScript file
+export function hello(): string {
+  return 'Hello World';
+}
`;
    
    const parser = new DiffParser();
    const result = parser.parse(diff);
    
    expect(result.files).toHaveLength(1);
    expect(result.files[0].status).toBe('added');
    expect(result.files[0].newPath).toBe('newfile.ts');
  });
});