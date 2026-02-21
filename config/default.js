/**
 * Default configuration for DiffAgent
 */
module.exports = {
  // Risk assessment thresholds
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  },
  
  // Enable/disable features
  features: {
    changeClassification: true,
    riskAssessment: true,
    impactAnalysis: true,
    securityChecks: true
  },
  
  // Language-specific settings
  languageSettings: {
    javascript: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      analyzeDependencies: true
    },
    python: {
      extensions: ['.py'],
      analyzeImports: true
    },
    java: {
      extensions: ['.java'],
      analyzePackages: true
    }
  },
  
  // Output format options
  output: {
    includeRawDiff: false,
    includeLineNumbers: true,
    detailedAnalysis: true
  }
};