/**
 * TypeScript Test Coverage Recommendations
 * Provides test-specific recommendations for TypeScript code changes
 */

class TypescriptTestRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.testPatterns = {
      // Jest patterns for TypeScript
      jest: {
        testFile: /.*\.test\.ts$|.*\.spec\.ts$/,
        describeBlock: /describe\(/,
        testBlock: /test\(/,
        expectStatement: /expect\(/,
        asyncTest: /async\s+\w+\s*\(/,
        mockFunction: /jest\.fn\(/,
        mockModule: /jest\.mock\(/,
        beforeEach: /beforeEach\(/,
        afterEach: /afterEach\(/,
        setupFile: /setupTests\.ts$/
      },
      // Testing Library patterns
      testingLibrary: {
        render: /render\(/,
        screen: /screen\./,
        fireEvent: /fireEvent\./,
        waitFor: /waitFor\(/,
        act: /act\(/,
        within: /within\(/,
        getBy: /getBy\w+\(/,
        queryBy: /queryBy\w+\(/,
        findBy: /findBy\w+\(/
      }
    };
  }

  /**
   * Generate test coverage recommendations for TypeScript files
   * @param {Object} fileAnalysis - Analysis result for a TypeScript file
   * @returns {Array} Test coverage recommendations
   */
  generate(fileAnalysis) {
    const recommendations = [];
    const content = fileAnalysis.content || '';
    const filePath = fileAnalysis.newPath || '';
    
    // Check if this is a source file that should have tests
    if (this._isSourceFile(filePath)) {
      // Check for missing test file
      if (!this._hasTestFile(filePath)) {
        recommendations.push({
          type: 'missing_test_file',
          severity: 'high',
          category: 'testing',
          message: `No test file found for ${filePath}. Consider adding TypeScript tests.`,
          suggestion: this._generateTestFileSuggestion(filePath),
          confidence: 0.9
        });
      }
      
      // Analyze the content for test-related patterns
      const testAnalysis = this._analyzeTestCoverage(content, fileAnalysis);
      recommendations.push(...testAnalysis);
    }
    
    return recommendations;
  }

  /**
   * Check if a file is a source file (not test, config, etc.)
   */
  _isSourceFile(filePath) {
    if (!filePath) return false;
    const lowerPath = filePath.toLowerCase();
    
    // Exclude test files, config files, documentation, etc.
    const excludePatterns = [
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
      /package\.json$/,
      /README/,
      /node_modules/
    ];
    
    return !excludePatterns.some(pattern => pattern.test(lowerPath));
  }

  /**
   * Check if a corresponding test file exists
   */
  _hasTestFile(sourceFile) {
    // In a real implementation, this would check the file system
    // For demo purposes, we'll use a simple heuristic
    const hasTest = Math.random() > 0.7; // 30% chance of having tests
    return hasTest;
  }

  /**
   * Analyze test coverage based on code changes
   */
  _analyzeTestCoverage(content, fileAnalysis) {
    const recommendations = [];
    const classification = fileAnalysis.classification;
    
    // Analyze based on change type
    if (classification && classification.changeType) {
      switch (classification.changeType) {
        case 'bug_fix':
          recommendations.push({
            type: 'regression_testing',
            severity: 'high',
            category: 'testing',
            message: 'Bug fix detected in TypeScript code. Add regression tests to prevent future occurrences.',
            suggestion: 'Create a test case that reproduces the original bug and verifies the TypeScript fix.',
            confidence: 0.95
          });
          break;
          
        case 'feature':
          recommendations.push({
            type: 'feature_testing',
            severity: 'medium',
            category: 'testing',
            message: 'New TypeScript feature added. Ensure comprehensive test coverage including edge cases.',
            suggestion: 'Add unit tests covering all new functionality and TypeScript type safety scenarios.',
            confidence: 0.85
          });
          break;
          
        case 'security_fix':
          recommendations.push({
            type: 'security_testing',
            severity: 'critical',
            category: 'testing',
            message: 'Security fix detected in TypeScript code. Add security-focused tests.',
            suggestion: 'Implement TypeScript-specific security tests including input validation and type safety checks.',
            confidence: 0.98
          });
          break;
          
        case 'performance_optimization':
          recommendations.push({
            type: 'performance_testing',
            severity: 'medium',
            category: 'testing',
            message: 'Performance optimization detected in TypeScript code. Add performance benchmarks.',
            suggestion: 'Create TypeScript benchmark tests to measure and verify the performance improvement.',
            confidence: 0.8
          });
          break;
      }
    }
    
    // Check for TypeScript-specific test patterns
    if (content.includes('interface') || content.includes('type')) {
      recommendations.push({
        type: 'type_testing',
        severity: 'medium',
        category: 'testing',
        message: 'TypeScript interfaces or types detected. Consider adding type safety tests.',
        suggestion: 'Use Jest with ts-jest to verify type safety and catch type-related errors at compile time.',
        confidence: 0.75
      });
    }
    
    if (content.includes('async') || content.includes('Promise')) {
      recommendations.push({
        type: 'async_testing',
        severity: 'medium',
        category: 'testing',
        message: 'Async/await or Promise usage detected. Ensure proper async testing.',
        suggestion: 'Use async/await in your Jest tests and handle promise rejections properly.',
        confidence: 0.8
      });
    }
    
    if (content.includes('React') || content.includes('Component')) {
      recommendations.push({
        type: 'react_testing',
        severity: 'medium',
        category: 'testing',
        message: 'React components detected in TypeScript. Add component tests.',
        suggestion: 'Use React Testing Library with TypeScript for comprehensive component testing.',
        confidence: 0.85
      });
    }
    
    return recommendations;
  }

  /**
   * Generate a suggestion for creating a test file
   */
  _generateTestFileSuggestion(sourceFile) {
    if (!sourceFile) return 'Create appropriate TypeScript test file';
    const dir = sourceFile.substring(0, sourceFile.lastIndexOf('/'));
    const filename = sourceFile.substring(sourceFile.lastIndexOf('/') + 1);
    const name = filename.substring(0, filename.lastIndexOf('.'));
    
    return `Create ${dir}/${name}.test.ts using Jest with ts-jest for TypeScript support. Include tests for all functions, type safety, and edge cases.`;
  }
}

module.exports = TypescriptTestRecommendations;