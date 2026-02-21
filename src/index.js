/**
 * DiffAgent - Intelligent Code Diff Analysis Agent
 * Main entry point for the DiffAgent library
 */

const DiffAgent = require('./diffAgent');

// Export the main class
module.exports = DiffAgent;

// For CLI usage
if (require.main === module) {
  // Simple CLI interface
  const fs = require('fs');
  
  if (process.argv.length < 3) {
    console.log('Usage: node src/index.js <diff-file>');
    process.exit(1);
  }
  
  const diffFile = process.argv[2];
  const diffContent = fs.readFileSync(diffFile, 'utf8');
  
  const agent = new DiffAgent();
  const result = agent.analyze(diffContent);
  
  console.log(JSON.stringify(result, null, 2));
}