/**
 * DiffAgent - Intelligent Code Diff Analysis Agent
 * Main entry point for the DiffAgent library
 */

const DiffAgent = require('./diffAgent');
const { initDatabase } = require('./database/init');

// Export the main class
module.exports = DiffAgent;

// Initialize database on startup if enabled
async function initialize() {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.warn('⚠️ Database initialization failed:', error.message);
    console.warn('⚠️ Running in memory-only mode');
  }
}

// For CLI usage
if (require.main === module) {
  // Simple CLI interface
  const fs = require('fs');
  
  if (process.argv.length < 3) {
    console.log('Usage: node src/index.js <diff-file>');
    process.exit(1);
  }
  
  initialize().then(() => {
    const diffFile = process.argv[2];
    const diffContent = fs.readFileSync(diffFile, 'utf8');
    
    const agent = new DiffAgent();
    const result = agent.analyze(diffContent);
    
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('Failed to initialize:', error);
    process.exit(1);
  });
}