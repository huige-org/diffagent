/**
 * Language Detector - Detects programming languages from file paths and content
 */

class LanguageDetector {
  constructor() {
    this.languagePatterns = {
      // JavaScript family
      javascript: [/\.js$/, /\.jsx$/],
      typescript: [/\.ts$/, /\.tsx$/],
      
      // Python family  
      python: [/\.py$/],
      
      // Java family
      java: [/\.java$/],
      kotlin: [/\.kt$/, /\.kts$/],
      
      // Go
      go: [/\.go$/],
      
      // Configuration files
      json: [/\.json$/],
      yaml: [/\.yml$/, /\.yaml$/],
      toml: [/\.toml$/]
    };
    
    this.fileTypeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript', 
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.kt': 'kotlin',
      '.kts': 'kotlin',
      '.go': 'go',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.toml': 'toml'
    };
  }

  /**
   * Detect language from file path
   * @param {string} filePath - File path to analyze
   * @returns {string} Detected language
   */
  detectLanguage(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return 'unknown';
    }
    
    // Try file extension mapping first (faster)
    const ext = filePath.toLowerCase().split('.').pop();
    if (this.fileTypeMap[`.${ext}`]) {
      return this.fileTypeMap[`.${ext}`];
    }
    
    // Fallback to pattern matching
    for (const [language, patterns] of Object.entries(this.languagePatterns)) {
      if (patterns.some(pattern => pattern.test(filePath))) {
        return language;
      }
    }
    
    return 'unknown';
  }

  /**
   * Get all supported languages
   * @returns {Array} List of supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.languagePatterns);
  }

  /**
   * Check if language is supported
   * @param {string} language - Language to check
   * @returns {boolean} True if supported
   */
  isLanguageSupported(language) {
    return this.getSupportedLanguages().includes(language);
  }
}

module.exports = LanguageDetector;