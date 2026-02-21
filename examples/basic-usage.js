const DiffAgent = require('../src/index');

// Example 1: Analyze a simple git diff
const simpleDiff = `diff --git a/README.md b/README.md
index abc123..def456 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # My Project
+## New Section
 This is my project.
`;

const agent = new DiffAgent();
const analysis = agent.analyzeDiff(simpleDiff);
console.log('Analysis Results:', JSON.stringify(analysis, null, 2));

// Example 2: Process multiple diffs
const diffs = [simpleDiff, /* more diffs */];
const summary = agent.summarizeChanges(diffs);
console.log('Change Summary:', summary);

// Example 3: Get AI-friendly description
const aiDescription = agent.generateAIDescription(simpleDiff);
console.log('AI Description:', aiDescription);