const fs = require('fs');
const path = require('path');

class MLConfigLoader {
  constructor() {
    this.defaultConfig = {
      enabled: true,
      modelPath: './ml/model.js',
      trainingDataPath: './ml/training-data.json',
      weights: {
        security: 0.8,
        performance: 0.9,
        quality: 0.6,
        test: 0.7
      },
      thresholds: {
        highRisk: 0.7,
        mediumRisk: 0.4,
        lowRisk: 0.1
      }
    };
  }

  loadConfig(customConfig = {}) {
    try {
      const configPath = path.join(__dirname, '..', 'ml', 'config.json');
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...this.defaultConfig, ...fileConfig, ...customConfig };
      }
    } catch (error) {
      console.warn('Failed to load ML config:', error.message);
    }
    return { ...this.defaultConfig, ...customConfig };
  }
}

module.exports = MLConfigLoader;