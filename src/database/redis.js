const redis = require('redis');

class RedisCache {
  constructor(config = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0,
      keyPrefix: 'diffagent:',
      connectionTimeout: 10000,
      commandTimeout: 5000,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableOfflineQueue: true,
      ...config
    };
    
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const clientConfig = {
        socket: {
          host: this.config.host,
          port: this.config.port,
          connectTimeout: this.config.connectionTimeout,
          keepAlive: 10000
        },
        database: this.config.db,
        username: this.config.username,
        password: this.config.password,
        legacyMode: false
      };

      if (this.config.tls) {
        clientConfig.socket.tls = true;
      }

      this.client = redis.createClient(clientConfig);

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
      
      // Test connection
      await this.client.ping();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Cache analysis results
  async cacheAnalysisResult(key, result, ttl = 3600) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}analysis:${key}`;
      await this.client.setEx(cacheKey, ttl, JSON.stringify(result));
      return true;
    } catch (error) {
      console.error('Failed to cache analysis result:', error);
      return false;
    }
  }

  async getAnalysisResult(key) {
    if (!this.isConnected) {
      return null;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}analysis:${key}`;
      const cached = await this.client.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached analysis result:', error);
      return null;
    }
  }

  // Cache user preferences
  async cacheUserPreferences(userId, preferences, ttl = 86400) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}user:${userId}:prefs`;
      await this.client.setEx(cacheKey, ttl, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Failed to cache user preferences:', error);
      return false;
    }
  }

  async getUserPreferences(userId) {
    if (!this.isConnected) {
      return null;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}user:${userId}:prefs`;
      const cached = await this.client.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached user preferences:', error);
      return null;
    }
  }

  // Generic cache methods
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}${key}`;
      await this.client.setEx(cacheKey, ttl, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to set cache value:', error);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      return null;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}${key}`;
      const value = await this.client.get(cacheKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get cache value:', error);
      return null;
    }
  }

  async delete(key) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      const cacheKey = `${this.config.keyPrefix}${key}`;
      await this.client.del(cacheKey);
      return true;
    } catch (error) {
      console.error('Failed to delete cache value:', error);
      return false;
    }
  }
}

module.exports = RedisCache;