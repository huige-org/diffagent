/**
 * TypeScript Security Recommendations
 * Provides security-specific recommendations for TypeScript code
 */

class TypeScriptSecurityRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.securityPatterns = {
      // XSS patterns for TypeScript/React
      xss: [
        /innerHTML\s*=|document\.write\(/,
        /eval\(/,
        /new Function\(/,
        /dangerouslySetInnerHTML/,
        /{.*__html.*}/
      ],
      // Type safety issues
      typeSafety: [
        /any\s*[;,)]/,
        /unknown\s*as\s*\w+/,
        /!$/ // Non-null assertion operator
      ],
      // Hardcoded secrets
      hardcodedSecrets: [
        /password\s*[:=]\s*['"][^'"]{8,}['"]/,
        /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/,
        /secret\s*[:=]\s*['"][^'"]{8,}['"]/,
        /token\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/
      ]
    };
  }

  /**
   * Generate TypeScript security recommendations
   * @param {Object} fileAnalysis - Analysis result for a TypeScript file
   * @returns {Array} Security recommendations
   */
  generate(fileAnalysis) {
    const recommendations = [];
    const content = fileAnalysis.content || '';
    
    // Check for XSS vulnerabilities
    if (this._matchesPattern(content, this.securityPatterns.xss)) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        category: 'xss',
        message: 'Potential XSS vulnerability detected in TypeScript/React code.',
        suggestion: 'Use textContent instead of innerHTML, or sanitize input with DOMPurify.',
        references: ['https://owasp.org/www-community/attacks/xss/']
      });
    }
    
    // Check for type safety issues
    if (this._matchesPattern(content, this.securityPatterns.typeSafety)) {
      recommendations.push({
        type: 'security',
        severity: 'medium',
        category: 'type-safety',
        message: 'Type safety issues detected. Using "any" or non-null assertions can lead to runtime errors.',
        suggestion: 'Use proper TypeScript types and avoid "any" type. Handle null/undefined cases explicitly.',
        references: ['https://www.typescriptlang.org/docs/handbook/type-checking.html']
      });
    }
    
    // Check for hardcoded secrets
    if (this._matchesPattern(content, this.securityPatterns.hardcodedSecrets)) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        category: 'hardcoded-secrets',
        message: 'Hardcoded credentials or secrets detected in TypeScript code.',
        suggestion: 'Move secrets to environment variables or use a secure secrets manager.',
        references: ['https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication']
      });
    }
    
    return recommendations;
  }
  
  /**
   * Check if content matches any pattern in the list
   */
  _matchesPattern(content, patterns) {
    return patterns.some(pattern => pattern.test(content));
  }
}

module.exports = TypeScriptSecurityRecommendations;