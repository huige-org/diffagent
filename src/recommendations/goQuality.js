/**
 * Go Code Quality Recommendations
 * Provides Go-specific code quality suggestions based on diff analysis
 */

class GoCodeQualityRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.qualityPatterns = {
      // Go specific patterns
      'unused-import': /import\s+\(\s*"[^"]+"\s*\)/,
      'naked-return': /return\s*$/,
      'magic-number': /\b\d{2,}\b/,
      'context-cancellation': /func\s+\w+\([^)]*\)\s*{\s*[^}]*time\.After\(/,
      'error-handling': /if\s+err\s*!=\s*nil\s*{\s*}/,
      'goroutine-leak': /go\s+\w+\s*\([^)]*\)/,
      'mutex-usage': /sync\.Mutex/,
      'interface-pollution': /type\s+\w+\s+interface\s*{\s*[^}]*\w+\(\)[^}]*\w+\(\)/,
      'package-naming': /package\s+\w*[A-Z]\w*/,
      'receiver-naming': /func\s+\(\w+\s+\w+\)/
    };
  }

  /**
   * Generate Go code quality recommendations
   * @param {Object} fileDiff - The file diff object with classification
   * @returns {Array} Array of recommendation objects
   */
  generate(fileDiff) {
    const recommendations = [];
    const content = this._extractContent(fileDiff);
    
    // Check for Go specific quality issues
    recommendations.push(...this._checkGoQualityIssues(content, fileDiff));
    
    return recommendations.filter(rec => rec !== null);
  }

  /**
   * Extract content from file diff
   */
  _extractContent(fileDiff) {
    if (!fileDiff.hunks || !Array.isArray(fileDiff.hunks)) {
      return '';
    }
    
    let content = '';
    fileDiff.hunks.forEach(hunk => {
      if (hunk && hunk.lines && Array.isArray(hunk.lines)) {
        hunk.lines.forEach(line => {
          if (line && typeof line === 'string' && 
              !line.startsWith('---') && !line.startsWith('+++')) {
            content += line.substring(1) + '\n';
          }
        });
      }
    });
    return content;
  }

  /**
   * Check for Go specific quality issues
   */
  _checkGoQualityIssues(content, fileDiff) {
    const recommendations = [];
    
    // Unused imports
    if (this.qualityPatterns['unused-import'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'imports',
        message: 'Potential unused import detected.',
        suggestion: 'Remove unused imports to reduce binary size and improve clarity.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    // Naked returns
    if (this.qualityPatterns['naked-return'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'readability',
        message: 'Naked return detected in named return function.',
        suggestion: 'Explicitly return values for better readability and maintainability.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Magic numbers
    if (this.qualityPatterns['magic-number'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'maintainability',
        message: 'Magic number detected. Consider using named constants.',
        suggestion: 'Define constants like "const MaxRetries = 3" for better code maintainability.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }

    // Context cancellation
    if (this.qualityPatterns['context-cancellation'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'high',
        category: 'concurrency',
        message: 'Potential context cancellation issue with time.After().',
        suggestion: 'Use time.NewTimer() with proper cleanup or context.WithTimeout() instead.',
        file: fileDiff.newPath,
        confidence: 0.9
      });
    }

    // Error handling
    if (this.qualityPatterns['error-handling'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'error-handling',
        message: 'Empty error handling block detected.',
        suggestion: 'Add proper error handling logic or log the error for debugging.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }

    // Goroutine leaks
    if (this.qualityPatterns['goroutine-leak'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'high',
        category: 'concurrency',
        message: 'Potential goroutine leak detected.',
        suggestion: 'Ensure goroutines have proper exit conditions and use worker pools for controlled concurrency.',
        file: fileDiff.newPath,
        confidence: 0.9
      });
    }

    // Mutex usage
    if (this.qualityPatterns['mutex-usage'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'concurrency',
        message: 'Mutex usage detected. Ensure proper locking patterns.',
        suggestion: 'Consider using sync.RWMutex for read-heavy workloads or channels for communication.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Interface pollution
    if (this.qualityPatterns['interface-pollution'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'design',
        message: 'Large interface detected. Consider smaller, focused interfaces.',
        suggestion: 'Follow Go\'s "accept interfaces, return structs" principle with smaller interfaces.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    // Package naming
    if (this.qualityPatterns['package-naming'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'naming',
        message: 'Package name contains uppercase letters.',
        suggestion: 'Use lowercase package names following Go conventions (e.g., "http" not "HTTP").',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }

    // Receiver naming
    if (this.qualityPatterns['receiver-naming'].test(content)) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'naming',
        message: 'Generic receiver name detected.',
        suggestion: 'Use descriptive receiver names (e.g., "svc" for service, "db" for database).',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }

    return recommendations;
  }
}

module.exports = GoCodeQualityRecommendations;