const path = require('path');
const fs = require('fs');

/**
 * Load configuration for DiffAgent
 * @param {Object} userConfig - User provided configuration
 * @returns {Object} Merged configuration
 */
function loadConfig(userConfig = {}) {
  // Default configuration
  const defaultConfig = {
    riskThreshold: 0.5,
    enableImpactAnalysis: true,
    enableRecommendations: true,
    languageSupport: ['javascript', 'typescript', 'python', 'java', 'go'],
    maxFileSize: 1024 * 1024, // 1MB
    timeoutMs: 30000
  };

  return { ...defaultConfig, ...userConfig };
}

module.exports = { loadConfig };