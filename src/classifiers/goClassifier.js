/**
 * Go Language Classifier and Analyzer
 * Provides Go-specific code analysis and recommendations
 */

const { detectLanguage } = require('../utils/languageUtils');

class GoClassifier {
  constructor(config = {}) {
    this.config = config;
    this.goPatterns = {
      // Go specific patterns
      goroutines: /go\s+\w+\s*\([^)]*\)/,
      channels: /chan\s+\w+/,
      interfaces: /type\s+\w+\s+interface\s*{/,
      structs: /type\s+\w+\s+struct\s*{/,
      methods: /func\s+\(\w+\s+\*\w+\)\s+\w+\s*\(/,
      httpHandlers: /func\s+\w+\s*\(\w+\s+http.ResponseWriter,\s+\w+\s+\*http.Request\)/,
      
      // Performance anti-patterns
      inefficientGoroutines: /go\s+\w+\s*\([^)]*\)/,
      missingBufferPooling: /bytes\.NewBuffer\(/,
      inefficientErrorHandling: /if\s+err\s*!=\s*nil\s*{\s*return\s+err\s*}/,
      
      // Security patterns
      hardcodedSecrets: /password\s*[:=]\s*['"][^'"]{8,}['"]/,
      insecureHTTP: /http\.Get\(|http\.Post\(/,
      
      // Best practices
      contextUsage: /context\.Context/,
      errorWrapping: /fmt\.Errorf\([^)]*\%w[^)]*\)/,
      deferUsage: /defer\s+\w+\s*\(/,
    };
  }

  /**
   * Classify Go code changes
   * @param {Object} fileDiff - The file diff object
   * @returns {Object} Classification result
   */
  classify(fileDiff) {
    try {
      const content = this._extractContent(fileDiff);
      const addedLines = fileDiff.additions || 0;
      const removedLines = fileDiff.deletions || 0;
      const totalChanges = addedLines + removedLines;

      // Check for specific Go patterns
      if (this._matchesPattern(content, this.goPatterns.goroutines)) {
        return { changeType: 'performance_optimization', confidence: 0.7, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      if (this._matchesPattern(content, this.goPatterns.interfaces)) {
        return { changeType: 'feature', confidence: 0.8, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      if (this._matchesPattern(content, this.goPatterns.httpHandlers)) {
        return { changeType: 'feature', confidence: 0.8, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      if (this._matchesPattern(content, this.goPatterns.methods)) {
        return { changeType: 'feature', confidence: 0.7, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      if (this._matchesPattern(content, this.goPatterns.structs)) {
        return { changeType: 'feature', confidence: 0.7, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      // Check for security fixes
      if (this._matchesPattern(content, this.goPatterns.insecureHTTP) && 
          (content.includes('https') || content.includes('tls'))) {
        return { changeType: 'security_fix', confidence: 0.9, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      // Check for performance optimizations
      if (this._matchesPattern(content, this.goPatterns.missingBufferPooling)) {
        return { changeType: 'performance_optimization', confidence: 0.8, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      if (this._matchesPattern(content, this.goPatterns.contextUsage)) {
        return { changeType: 'feature', confidence: 0.6, details: { addedLines, removedLines, totalChanges, content } };
      }
      
      // Default classification based on change patterns
      if (addedLines > removedLines * 2) {
        return { changeType: 'feature', confidence: 0.6, details: { addedLines, removedLines, totalChanges, content } };
      } else if (removedLines > addedLines * 2) {
        return { changeType: 'refactor', confidence: 0.5, details: { addedLines, removedLines, totalChanges, content } };
      } else {
        return { changeType: 'bug_fix', confidence: 0.4, details: { addedLines, removedLines, totalChanges, content } };
      }
    } catch (error) {
      console.warn(`Go classification error:`, error.message);
      // Fallback to generic classification
      const addedLines = fileDiff.additions || 0;
      const removedLines = fileDiff.deletions || 0;
      const totalChanges = addedLines + removedLines;
      return { changeType: 'other', confidence: 0.3, details: { addedLines, removedLines, totalChanges, content: '' } };
    }
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
   * Check if content matches any pattern in the list
   */
  _matchesPattern(content, patterns) {
    if (typeof patterns === 'object' && !Array.isArray(patterns)) {
      // Handle object of patterns
      return Object.values(patterns).some(pattern => 
        Array.isArray(pattern) ? pattern.some(p => p.test(content)) : pattern.test(content)
      );
    }
    
    if (Array.isArray(patterns)) {
      return patterns.some(pattern => pattern.test(content));
    }
    
    return patterns.test(content);
  }
}

module.exports = GoClassifier;