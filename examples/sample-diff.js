// Sample diff for testing
const sampleDiff = `diff --git a/src/utils.js b/src/utils.js
index abc123..def456 100644
--- a/src/utils.js
+++ b/src/utils.js
@@ -1,5 +1,8 @@
 // Utility functions
-function calculateRisk(score) {
-  return score > 0.7 ? 'high' : score > 0.3 ? 'medium' : 'low';
+function calculateRisk(score, threshold = 0.7) {
+  if (score >= threshold) {
+    return 'high';
+  } else if (score >= 0.3) {
+    return 'medium';
+  }
+  return 'low';
 }
 
 function isValidDiff(diff) {
@@ -10,3 +13,7 @@ function isValidDiff(diff) {
   return diff && diff.length > 0;
 }
 
+// New utility function
+function getChangeType(changes) {
+  return changes.length > 0 ? 'modification' : 'addition';
+}
`;

module.exports = sampleDiff;