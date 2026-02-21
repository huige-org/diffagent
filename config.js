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
  
  // Supported file extensions
  supportedExtensions: [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.java', '.cpp', '.c',
    '.html', '.css', '.scss',
    '.json', '.yaml', '.yml'
  ]
};