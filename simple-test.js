const { DatabaseManager } = require('./src/database/db');

console.log('Testing DatabaseManager...');
try {
  const db = new DatabaseManager();
  console.log('✅ DatabaseManager created successfully');
  console.log('Database mode:', db.mode);
} catch (error) {
  console.error('❌ Error:', error.message);
}