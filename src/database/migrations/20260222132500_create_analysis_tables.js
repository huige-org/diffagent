/**
 * Database migration: Create analysis tables
 * Migration ID: 20260222132500
 */

const fs = require('fs');
const path = require('path');

async function up(client) {
  // Read the SQL file
  const sqlPath = path.join(__dirname, '../../database/init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Execute the SQL
  await client.query(sql);
  console.log('✅ Analysis tables created successfully');
}

async function down(client) {
  // Drop tables in reverse order
  const dropSql = `
    DROP TABLE IF EXISTS recommendations;
    DROP TABLE IF EXISTS analysis_results;
    DROP TABLE IF EXISTS code_diffs;
    DROP TABLE IF EXISTS user_preferences;
  `;
  
  await client.query(dropSql);
  console.log('🗑️ Analysis tables dropped successfully');
}

module.exports = { up, down };