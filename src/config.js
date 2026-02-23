// DiffAgent Configuration
module.exports = {
  // Analysis settings
  analysis: {
    // Maximum file size to analyze (in bytes)
    maxFileSize: 1024 * 1024, // 1MB
    
    // Enable semantic analysis
    enableSemanticAnalysis: true,
    
    // Risk assessment thresholds
    riskThresholds: {
      high: 0.8,
      medium: 0.5,
      low: 0.2
    }
  },
  
  // Output settings
  output: {
    // Include detailed explanations
    includeExplanations: true,
    
    // Format for suggestions
    suggestionFormat: 'markdown'
  },
  
  // Database settings
  database: {
    // Database mode: 'memory', 'postgres', 'mysql', 'mongodb'
    mode: 'memory',
    
    // Memory database settings
    memory: {
      enabled: true,
      maxSize: 1000, // Maximum number of records to keep in memory
      persistToFile: false, // Whether to persist to file
      persistenceFile: './data/memory-db.json'
    },
    
    // PostgreSQL settings
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'diffagent_db',
      user: process.env.POSTGRES_USER || 'diffagent_user',
      password: process.env.POSTGRES_PASSWORD || 'diffagent_password',
      ssl: process.env.POSTGRES_SSL_MODE === 'require',
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000
      }
    }
  },
  
  // Cache settings
  cache: {
    enabled: true,
    type: 'memory', // 'memory' or 'redis'
    ttl: 3600, // Time to live in seconds
    maxSize: 100 // Maximum number of cached items
  },
  
  // Supported file extensions
  supportedExtensions: [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.java', '.cpp', '.c',
    '.html', '.css', '.scss',
    '.json', '.yaml', '.yml'
  ]
};