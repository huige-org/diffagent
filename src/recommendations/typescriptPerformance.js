/**
 * TypeScript Performance Recommendations
 * Provides performance-specific suggestions for TypeScript code changes
 */

class TypeScriptPerformanceRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.performancePatterns = {
      // Common TypeScript performance anti-patterns
      unnecessaryTypeAssertions: /as\s+\w+|<\w+>/,
      excessiveGenerics: /<.*<.*<.*>>>/,
      complexUnionTypes: /\|.*\|.*\|.*\|/,
      unnecessaryAsyncAwait: /async\s+\w+\s*\([^)]*\)\s*{[^}]*return\s+[^a-zA-Z]/,
      inefficientArrayOperations: /\.map\(|\.filter\(|\.reduce\(/,
      
      // React TypeScript specific
      unnecessaryReRender: /React\.memo\(/,
      inefficientHooks: /useEffect\([^)]*=>[^}]*useState\(/,
      missingMemoization: /useCallback\(|useMemo\(/,
      
      // Node.js TypeScript specific
      blockingOperations: /fs\.readFileSync\(|child_process\.spawnSync\(/,
      inefficientPromises: /new Promise\(\(resolve, reject\)/
    };
  }

  /**
   * Generate TypeScript performance recommendations based on code changes
   * @param {Object} fileDiff - The file diff object with classification
   * @returns {Array} Array of performance recommendations
   */
  generate(fileDiff) {
    const recommendations = [];
    const content = this._extractContent(fileDiff);
    
    // Check for general TypeScript performance issues
    recommendations.push(...this._checkGeneralPerformanceIssues(content, fileDiff));
    
    // Check for framework-specific performance issues
    if (content.includes('React') || content.includes('react')) {
      recommendations.push(...this._checkReactPerformanceIssues(content, fileDiff));
    }
    
    if (content.includes('express') || content.includes('node')) {
      recommendations.push(...this._checkNodePerformanceIssues(content, fileDiff));
    }
    
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
   * Check for general TypeScript performance issues
   */
  _checkGeneralPerformanceIssues(content, fileDiff) {
    const recommendations = [];
    
    // Unnecessary type assertions
    if (this.performancePatterns.unnecessaryTypeAssertions.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        message: 'Unnecessary type assertions detected. Consider using type inference instead.',
        suggestion: 'Remove unnecessary "as" assertions or angle bracket assertions when TypeScript can infer types.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    // Excessive nested generics
    if (this.performancePatterns.excessiveGenerics.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Excessive nested generics detected. This may impact compilation performance.',
        suggestion: 'Consider simplifying generic types or creating type aliases for complex generics.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Complex union types
    if (this.performancePatterns.complexUnionTypes.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Complex union types with many members detected. This may impact type checking performance.',
        suggestion: 'Consider using discriminated unions or breaking complex types into smaller pieces.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Unnecessary async/await
    if (this.performancePatterns.unnecessaryAsyncAwait.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        message: 'Unnecessary async function detected. Consider removing async if no await is used.',
        suggestion: 'Remove async keyword or add await statements for asynchronous operations.',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }

    // Inefficient array operations in render loops
    if (this.performancePatterns.inefficientArrayOperations.test(content) && 
        (content.includes('render') || content.includes('return'))) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Large array operations detected in render path. This may cause performance issues.',
        suggestion: 'Consider memoizing the result or moving the operation outside the render function.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    return recommendations;
  }

  /**
   * Check for React-specific performance issues
   */
  _checkReactPerformanceIssues(content, fileDiff) {
    const recommendations = [];
    
    // Missing React.memo
    if (!this.performancePatterns.unnecessaryReRender.test(content) && 
        (content.includes('function') || content.includes('const')) &&
        content.includes('props')) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'React component without memoization. Consider using React.memo() for better performance.',
        suggestion: 'Wrap your component with React.memo() to prevent unnecessary re-renders.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Inefficient hooks usage
    if (this.performancePatterns.inefficientHooks.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Potential infinite loop in useEffect hook. Dependencies may be missing or incorrect.',
        suggestion: 'Review useEffect dependencies and ensure all referenced values are included in the dependency array.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }

    // Missing useCallback/useMemo
    if (!this.performancePatterns.missingMemoization.test(content) && 
        content.includes('function') && 
        (content.includes('useEffect') || content.includes('useContext'))) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Functions passed to hooks should be memoized with useCallback or useMemo.',
        suggestion: 'Wrap functions with useCallback() or useMemo() to prevent unnecessary re-creations.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    return recommendations;
  }

  /**
   * Check for Node.js-specific performance issues
   */
  _checkNodePerformanceIssues(content, fileDiff) {
    const recommendations = [];
    
    // Blocking operations
    if (this.performancePatterns.blockingOperations.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Blocking synchronous operations detected. This may impact server performance.',
        suggestion: 'Use asynchronous alternatives like fs.promises.readFile() or child_process.spawn().',
        file: fileDiff.newPath,
        confidence: 0.9
      });
    }

    // Inefficient promise creation
    if (this.performancePatterns.inefficientPromises.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Manual Promise creation detected. Consider using async/await or existing Promise utilities.',
        suggestion: 'Use async/await syntax or built-in Promise methods instead of manual Promise construction.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    return recommendations;
  }
}

module.exports = TypeScriptPerformanceRecommendations;