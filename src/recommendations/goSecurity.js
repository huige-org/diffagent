/**
 * Go Security Recommendations
 * Provides security-specific recommendations for Go code changes
 */

class GoSecurityRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.securityPatterns = {
      // Command injection patterns
      commandInjection: [
        /exec\.Command\(/,
        /os\.Exec\(/,
        /syscall\.Exec\(/,
        /sh -c/,
        /bash -c/
      ],
      // Path traversal patterns
      pathTraversal: [
        /filepath\.Join\([^)]*\.\.\.[^)]*\)/,
        /path\.Join\([^)]*\.\.\.[^)]*\)/,
        /\/\.\.\//,
        /\\\.\\\./
      ],
      // Insecure random generation
      insecureRandom: [
        /math\.Rand\(/,
        /rand\.New\(rand\.NewSource\(/,
        /crypto\/rand is not used/
      ],
      // Hardcoded secrets
      hardcodedSecrets: [
        /password\s*[:=]\s*['"][^'"]{8,}['"]/,
        /apiKey\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/,
        /secret\s*[:=]\s*['"][^'"]{8,}['"]/,
        /token\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/
      ],
      // Insecure HTTP clients
      insecureHTTP: [
        /http\.Get\(/,
        /http\.Post\(/,
        /&http\.Client\{\}/,
        /http\.DefaultClient/
      ],
      // Missing error handling
      missingErrorHandling: [
        /_, err :=/,
        /result :=/,
        /if err != nil {\s*return\s*}\s*return result/
      ]
    };
  }

  /**
   * Generate security recommendations for Go code
   * @param {Object} fileAnalysis - Analysis result for a Go file
   * @returns {Array} Security recommendations
   */
  generate(fileAnalysis) {
    const recommendations = [];
    const content = fileAnalysis.content || '';
    
    // Check for command injection vulnerabilities
    if (this._matchesPattern(content, this.securityPatterns.commandInjection)) {
      recommendations.push({
        type: 'security',
        severity: 'critical',
        category: 'command-injection',
        message: 'Potential command injection vulnerability detected in Go code.',
        suggestion: 'Use safe alternatives or validate/sanitize all user inputs before passing to exec.Command().',
        references: ['https://owasp.org/www-community/attacks/Command_Injection']
      });
    }
    
    // Check for path traversal vulnerabilities
    if (this._matchesPattern(content, this.securityPatterns.pathTraversal)) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        category: 'path-traversal',
        message: 'Potential path traversal vulnerability detected.',
        suggestion: 'Use filepath.Clean() and validate paths against allowed directories.',
        references: ['https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control']
      });
    }
    
    // Check for insecure random number generation
    if (this._matchesPattern(content, this.securityPatterns.insecureRandom)) {
      recommendations.push({
        type: 'security',
        severity: 'medium',
        category: 'insecure-random',
        message: 'Insecure random number generation detected.',
        suggestion: 'Use crypto/rand instead of math/rand for security-sensitive operations.',
        references: ['https://pkg.go.dev/crypto/rand']
      });
    }
    
    // Check for hardcoded secrets
    if (this._matchesPattern(content, this.securityPatterns.hardcodedSecrets)) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        category: 'hardcoded-secrets',
        message: 'Hardcoded credentials or secrets detected in Go code.',
        suggestion: 'Move secrets to environment variables or use a secure secrets manager like HashiCorp Vault.',
        references: ['https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication']
      });
    }
    
    // Check for insecure HTTP clients
    if (this._matchesPattern(content, this.securityPatterns.insecureHTTP)) {
      recommendations.push({
        type: 'security',
        severity: 'medium',
        category: 'insecure-http',
        message: 'Insecure HTTP client usage detected.',
        suggestion: 'Configure HTTP clients with proper timeouts and TLS settings. Consider using http.Client with custom Transport.',
        references: ['https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure']
      });
    }
    
    // Check for missing error handling
    if (this._matchesPattern(content, this.securityPatterns.missingErrorHandling)) {
      recommendations.push({
        type: 'security',
        severity: 'medium',
        category: 'missing-error-handling',
        message: 'Missing error handling detected in Go code.',
        suggestion: 'Always check and handle errors returned by Go functions, especially for security-critical operations.',
        references: ['https://go.dev/doc/effective_go#errors']
      });
    }
    
    return recommendations;
  }
  
  /**
   * Check if content matches any pattern in the list
   * @param {string} content - Content to check
   * @param {Array} patterns - Array of regex patterns
   * @returns {boolean} True if any pattern matches
   */
  _matchesPattern(content, patterns) {
    return patterns.some(pattern => pattern.test(content));
  }
}

module.exports = GoSecurityRecommendations;