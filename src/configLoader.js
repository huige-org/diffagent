const fs = require('fs');
const path = require('path');

function loadConfig(userConfig = {}) {
  const defaultConfig = {
    enableML: false,
    ml: {
      modelPath: path.join(__dirname, '../ml/model.js'),
      trainingDataPath: path.join(__dirname, '../ml/training-data.json')
    }
  };

  // Load ML config if it exists
  const mlConfigPath = path.join(__dirname, '../config/ml.json');
  let mlConfig = {};
  try {
    if (fs.existsSync(mlConfigPath)) {
      mlConfig = JSON.parse(fs.readFileSync(mlConfigPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Failed to load ML config:', error.message);
  }

  return {
    ...defaultConfig,
    ...userConfig,
    ml: {
      ...defaultConfig.ml,
      ...mlConfig,
      ...(userConfig.ml || {})
    }
  };
}

module.exports = { loadConfig };