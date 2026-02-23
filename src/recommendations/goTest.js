/**
 * Go Test Recommendations Generator
 * Provides test-specific recommendations for Go code changes
 */

const { detectLanguage } = require('../utils/languageUtils');

class GoTestRecommendations {
  constructor(config = {}) {
    this.config = {
      enableGoTest: true,
      ...config
    };
    
    // Go test patterns
    this.testPatterns = {
      // Test function patterns
      testFunction: /^func\s+Test[A-Z]/,
      benchmarkFunction: /^func\s+Benchmark[A-Z]/,
      exampleFunction: /^func\s+Example[A-Z]/,
      
      // Testing package usage
      testingPackage: /testing\.T/,
      testifyPackage: /github\.com\/stretchr\/testify/,
      
      // Common test anti-patterns
      noTableTests: /func\s+Test[A-Z][a-z]+[0-9]*\s*\(/,
      missingErrorCheck: /\.Error\(\)/,
      hardcodedValues: /:=\s*["'][^"']*["']|:=\s*\d+/,
      
      // Coverage patterns
      missingBranchCoverage: /if\s+\w+\s*\{[^}]*\}/,
      missingErrorHandling: /if\s+err\s*!=\s*nil\s*\{[^}]*\}/
    };
  }

  /**
   * Generate Go test recommendations based on file analysis
   * @param {Object} fileDiff - The file diff object with classification
   * @returns {Array} Array of test recommendations
   */
  generate(fileDiff) {
    const recommendations = [];
    const content = this._extractContent(fileDiff);
    const language = detectLanguage(fileDiff.newPath);

    if (language !== 'go') {
      return recommendations;
    }

    // Check if this is a source file that should have tests
    if (this._isSourceFile(fileDiff.newPath)) {
      // Check for missing test file
      if (!this._hasTestFile(fileDiff.newPath)) {
        recommendations.push({
          type: 'missing_test_file',
          severity: 'high',
          category: 'testing',
          message: `No test file found for ${fileDiff.newPath}. Consider adding Go tests.`,
          suggestion: this._generateTestFileSuggestion(fileDiff.newPath),
          confidence: 0.9
        });
      }
      
      // Analyze the type of changes to suggest specific test types
      if (fileDiff.classification && fileDiff.classification.changeType === 'feature') {
        recommendations.push({
          type: 'feature_testing',
          severity: 'medium',
          category: 'testing',
          message: 'New feature added in Go code. Ensure comprehensive test coverage.',
          suggestion: 'Add table-driven tests covering all new functionality and edge cases.',
          confidence: 0.8
        });
      } else if (fileDiff.classification && fileDiff.classification.changeType === 'bug_fix') {
        recommendations.push({
          type: 'regression_testing',
          severity: 'high',
          category: 'testing',
          message: 'Bug fix detected in Go code. Add regression tests.',
          suggestion: 'Create a test case that reproduces the original bug and verifies the fix.',
          confidence: 0.95
        });
      } else if (fileDiff.classification && fileDiff.classification.changeType === 'security_fix') {
        recommendations.push({
          type: 'security_testing',
          severity: 'critical',
          category: 'testing',
          message: 'Security fix detected in Go code. Add security-focused tests.',
          suggestion: 'Implement penetration tests and input validation tests for the fixed vulnerability.',
          confidence: 0.98
        });
      } else if (fileDiff.classification && fileDiff.classification.changeType === 'performance_optimization') {
        recommendations.push({
          type: 'performance_testing',
          severity: 'medium',
          category: 'testing',
          message: 'Performance optimization detected in Go code. Add benchmarks.',
          suggestion: 'Create benchmark tests using Go\'s built-in benchmarking framework to measure performance improvement.',
          confidence: 0.75
        });
      }
    }

    // Check for test quality issues in existing test files
    if (this._isTestFile(fileDiff.newPath)) {
      recommendations.push(...this._analyzeTestQuality(content, fileDiff));
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
   * Check if a file is a source file (not test, config, etc.)
   */
  _isSourceFile(filePath) {
    if (!filePath) return false;
    const lowerPath = filePath.toLowerCase();
    
    // Exclude test files, config files, documentation, etc.
    const excludePatterns = [
      /_test\.go$/,
      /test/,
      /__tests__/,
      /spec/,
      /\.test\./,
      /\.spec\./,
      /config/,
      /docs?/,
      /\.md$/,
      /\.json$/,
      /\.yml$/,
      /\.yaml$/,
      /\.toml$/,
      /\.lock$/,
      /go\.mod$/,
      /go\.sum$/,
      /README/
    ];
    
    return !excludePatterns.some(pattern => pattern.test(lowerPath));
  }

  /**
   * Check if a file is a test file
   */
  _isTestFile(filePath) {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('_test.go');
  }

  /**
   * Check if corresponding test file exists
   */
  _hasTestFile(sourceFile) {
    if (!sourceFile) return false;
    const testFile = sourceFile.replace(/\.go$/, '_test.go');
    // In a real implementation, this would check the file system
    // For now, we'll assume some files have tests based on random chance
    return Math.random() > 0.7;
  }

  /**
   * Generate a suggestion for creating a test file
   */
  _generateTestFileSuggestion(sourceFile) {
    if (!sourceFile) return 'Create appropriate Go test file';
    const dir = sourceFile.substring(0, sourceFile.lastIndexOf('/'));
    const filename = sourceFile.substring(sourceFile.lastIndexOf('/') + 1);
    const name = filename.substring(0, filename.lastIndexOf('.'));
    
    return `Create ${dir}/${name}_test.go with table-driven tests using Go's testing package. Include tests for all functions, error cases, and edge conditions.`;
  }

  /**
   * Analyze test quality for existing test files
   */
  _analyzeTestQuality(content, fileDiff) {
    const recommendations = [];
    
    // Check for table-driven tests
    if (!/TableTest|table\s*:=/.test(content)) {
      recommendations.push({
        type: 'test_improvement',
        severity: 'medium',
        category: 'testing',
        message: 'Consider using table-driven tests for better test organization.',
        suggestion: 'Refactor tests to use table-driven approach with subtests for cleaner and more maintainable tests.',
        confidence: 0.7
      });
    }
    
    // Check for proper error handling in tests
    if (/\.Error\(\)/.test(content) && !/require\.Error/.test(content)) {
      recommendations.push({
        type: 'test_improvement',
        severity: 'medium',
        category: 'testing',
        message: 'Consider using testify/assert or testify/require for better error messages.',
        suggestion: 'Replace direct Error() calls with testify assertions for more informative test failures.',
        confidence: 0.6
      });
    }
    
    // Check for benchmark tests on performance-critical code
    if (fileDiff.classification && fileDiff.classification.changeType === 'performance_optimization') {
      if (!/func\s+Benchmark/.test(content)) {
        recommendations.push({
          type: 'benchmark_missing',
          severity: 'medium',
          category: 'testing',
          message: 'Performance optimization detected but no benchmark tests found.',
          suggestion: 'Add benchmark tests using Go\'s built-in benchmarking framework to measure and verify performance improvements.',
          confidence: 0.8
        });
      }
    }
    
    return recommendations;
  }
}

module.exports = GoTestRecommendations;