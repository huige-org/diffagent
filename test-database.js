const DatabaseInitializer = require('./src/database/init');
const config = require('./src/config');

async function testDatabaseIntegration() {
  try {
    console.log('🧪 Testing database integration...');
    
    // Initialize database
    const dbInit = new DatabaseInitializer(config);
    const pool = await dbInit.initialize();
    
    console.log('✅ Database initialized successfully!');
    
    // Test basic query
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Test Redis connection
    const redis = require('./src/database/redis');
    const redisClient = redis.getClient();
    await redisClient.ping();
    console.log('✅ Redis connection successful!');
    
    await dbInit.close();
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseIntegration();