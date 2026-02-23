/**
 * TypeScript Code Quality Recommendations
 * Provides TypeScript-specific code quality suggestions
 */

class TypeScriptQualityRecommendations {
  constructor(config = {}) {
    this.config = {
      enableTypeScriptESLint: true,
      enableBestPractices: true,
      ...config
    };
    
    // TypeScript-specific quality patterns
    this.qualityPatterns = {
      // TypeScript ESLint rules
      'no-explicit-any': /any\s*[;,)/\]]/,
      'strict-null-checks': /!\s*\./,
      'no-unused-vars': /const\s+\w+\s*:\s*\w+\s*=\s*[^;]+;/,
      'prefer-readonly': /private\s+\w+\s*:\s*\w+\s*=\s*[^;]+;/,
      'no-non-null-assertion': /\w+!\s*[.;]/,
      
      // Type safety patterns
      'missing-type-annotations': /function\s+\w+\s*\([^)]*\)\s*{/,
      'implicit-any': /const\s+\w+\s*=\s*[^;]+;/,
      'unsafe-type-assertion': /as\s+\w+/,
      
      // Best practices
      'interface-vs-type': /type\s+\w+\s*=/,
      'enum-vs-const': /enum\s+\w+\s*{/,
      'optional-chaining': /\.(\w+)\s*\?\.\s*(\w+)/
    };
  }

  /**
   * Generate TypeScript quality recommendations
   * @param {Object} fileDiff - The file diff object
   * @returns {Array} Array of recommendation objects
   */
  generate(fileDiff) {
    const recommendations = [];
    const content = this._extractContent(fileDiff);
    
    // Check for explicit any usage
    if (this._matchesPattern(content, this.qualityPatterns['no-explicit-any'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'high',
        category: 'type-safety',
        message: 'Explicit "any" type detected. Consider using specific types or unknown.',
        suggestion: 'Replace "any" with specific interface/type or use "unknown" with type guards.',
        file: fileDiff.newPath,
        confidence: 0.9
      });
    }
    
    // Check for non-null assertions
    if (this._matchesPattern(content, this.qualityPatterns['no-non-null-assertion'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'null-safety',
        message: 'Non-null assertion operator (!) detected. Consider proper null checking.',
        suggestion: 'Use optional chaining (?.) or explicit null checks instead of non-null assertions.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }
    
    // Check for missing type annotations
    if (this._matchesPattern(content, this.qualityPatterns['missing-type-annotations'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'type-annotations',
        message: 'Function missing return type annotation. Consider adding explicit types.',
        suggestion: 'Add return type annotation to improve code readability and catch errors early.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }
    
    // Check for implicit any
    if (this._matchesPattern(content, this.qualityPatterns['implicit-any'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'medium',
        category: 'type-inference',
        message: 'Implicit "any" type detected due to missing type annotation.',
        suggestion: 'Add explicit type annotation to avoid implicit any and improve type safety.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }
    
    // Check for unsafe type assertions
    if (this._matchesPattern(content, this.qualityPatterns['unsafe-type-assertion'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'type-assertions',
        message: 'Type assertion detected. Consider using type guards instead.',
        suggestion: 'Use type guards or discriminated unions instead of type assertions for better safety.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }
    
    // Check for interface vs type usage
    if (this._matchesPattern(content, this.qualityPatterns['interface-vs-type'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'best-practices',
        message: 'Type alias used for object type. Consider using interface for better extensibility.',
        suggestion: 'Use "interface" instead of "type" for object types to enable declaration merging.',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }
    
    // Check for enum vs const usage
    if (this._matchesPattern(content, this.qualityPatterns['enum-vs-const'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'best-practices',
        message: 'Numeric enum detected. Consider using const enum or object literals.',
        suggestion: 'Use const enum for better performance or object literals for better tree-shaking.',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }
    
    // Check for optional chaining opportunities
    if (this._matchesPattern(content, this.qualityPatterns['optional-chaining'])) {
      recommendations.push({
        type: 'code-quality',
        severity: 'low',
        category: 'modern-syntax',
        message: 'Optional chaining pattern detected. Consider using modern TypeScript syntax.',
        suggestion: 'Use optional chaining (?.) and nullish coalescing (??) for cleaner null handling.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }
    
    return recommendations;
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
  _matchesPattern(content, pattern) {
    if (typeof pattern === 'string') {
      return content.includes(pattern);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(content);
    }
    if (Array.isArray(pattern)) {
      return pattern.some(p => this._matchesPattern(content, p));
    }
    return false;
  }
}

module.exports = TypeScriptQualityRecommendations;