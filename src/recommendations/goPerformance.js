/**
 * Go Performance Recommendations
 * Provides performance-specific suggestions for Go code changes
 */

const { detectLanguage } = require('../utils/languageUtils');

class GoPerformanceRecommendations {
  constructor(config = {}) {
    this.config = config;
    this.performancePatterns = {
      // Common Go performance anti-patterns
      inefficientGoroutines: /go\s+\w+\s*\([^)]*\)/,
      missingBufferPooling: /bytes\.NewBuffer\(/,
      unnecessaryAllocations: /make\(\[\]\w+,\s*0\)/,
      inefficientStringOperations: /\.String\(\)\s*\+\s*.*\.String\(\)/,
      missingConcurrencyLimits: /for\s+.*range.*{\s*go\s+/,
      
      // Go-specific patterns
      goroutineLeaks: /go\s+func\([^)]*\)\s*\{[^}]*}/,
      channelMisuse: /chan\s+\w+\s+[^=]*=/,
      mutexContention: /sync\.Mutex/,
      inefficientErrorHandling: /if\s+err\s*!=\s*nil\s*\{\s*return\s+err\s*\}/,
      unnecessaryInterfaceConversions: /interface\{\}\((\w+)\)/
    };
  }

  /**
   * Generate Go performance recommendations based on code changes
   * @param {Object} fileDiff - The file diff object with classification
   * @returns {Array} Array of performance recommendations
   */
  generate(fileDiff) {
    const recommendations = [];
    const content = this._extractContent(fileDiff);
    
    // Check for general Go performance issues
    recommendations.push(...this._checkGeneralGoPerformanceIssues(content, fileDiff));

    // Check for concurrency-related issues
    recommendations.push(...this._checkConcurrencyIssues(content, fileDiff));

    // Check for memory allocation issues
    recommendations.push(...this._checkMemoryAllocationIssues(content, fileDiff));

    // Check for error handling performance
    recommendations.push(...this._checkErrorHandlingPerformance(content, fileDiff));

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
   * Check for general Go performance anti-patterns
   */
  _checkGeneralGoPerformanceIssues(content, fileDiff) {
    const recommendations = [];
    
    // Inefficient goroutines
    if (this.performancePatterns.inefficientGoroutines.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Uncontrolled goroutine spawning detected. Consider using worker pools.',
        suggestion: 'Implement worker pool pattern to limit concurrent goroutines and prevent resource exhaustion.',
        file: fileDiff.newPath,
        confidence: 0.8
      });
    }

    // Missing buffer pooling
    if (this.performancePatterns.missingBufferPooling.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'New buffer allocation detected. Consider using sync.Pool for buffer reuse.',
        suggestion: 'Use sync.Pool to reuse buffers and reduce garbage collection pressure.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Unnecessary allocations
    if (this.performancePatterns.unnecessaryAllocations.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Unnecessary slice allocation with zero capacity detected.',
        suggestion: 'Consider using nil slices or pre-allocating with known capacity to avoid reallocations.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    // Inefficient string operations
    if (this.performancePatterns.inefficientStringOperations.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        message: 'Inefficient string concatenation detected.',
        suggestion: 'Use strings.Builder for efficient string building instead of repeated concatenation.',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }

    return recommendations;
  }

  /**
   * Check for concurrency-related performance issues
   */
  _checkConcurrencyIssues(content, fileDiff) {
    const recommendations = [];
    
    // Missing concurrency limits
    if (this.performancePatterns.missingConcurrencyLimits.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Unbounded goroutine creation in loop detected.',
        suggestion: 'Use semaphore pattern or worker pool to limit concurrent goroutines.',
        file: fileDiff.newPath,
        confidence: 0.9
      });
    }

    // Goroutine leaks
    if (this.performancePatterns.goroutineLeaks.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'critical',
        message: 'Potential goroutine leak detected.',
        suggestion: 'Ensure proper context cancellation and cleanup in anonymous goroutines.',
        file: fileDiff.newPath,
        confidence: 0.85
      });
    }

    // Channel misuse
    if (this.performancePatterns.channelMisuse.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Potential channel blocking issue detected.',
        suggestion: 'Consider using buffered channels or select statements with default cases to prevent blocking.',
        file: fileDiff.newPath,
        confidence: 0.7
      });
    }

    // Mutex contention
    if (this.performancePatterns.mutexContention.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Mutex usage detected. Consider lock granularity optimization.',
        suggestion: 'Review mutex usage and consider read-write locks or lock-free data structures where appropriate.',
        file: fileDiff.newPath,
        confidence: 0.6
      });
    }

    return recommendations;
  }

  /**
   * Check for memory allocation performance issues
   */
  _checkMemoryAllocationIssues(content, fileDiff) {
    const recommendations = [];
    
    // Look for map/slice pre-allocation opportunities
    const mapPattern = /map\[\w+\]\w+/;
    const slicePattern = /\[\]\w+/;
    
    if ((mapPattern.test(content) || slicePattern.test(content)) && 
        !/make\(.*,\s*\d+\)/.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        message: 'Map or slice creation without pre-allocation detected.',
        suggestion: 'Pre-allocate maps and slices with expected capacity to reduce memory reallocations.',
        file: fileDiff.newPath,
        confidence: 0.5
      });
    }

    return recommendations;
  }

  /**
   * Check for error handling performance issues
   */
  _checkErrorHandlingPerformance(content, fileDiff) {
    const recommendations = [];
    
    // Inefficient error handling
    if (this.performancePatterns.inefficientErrorHandling.test(content)) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        message: 'Simple error propagation detected.',
        suggestion: 'Consider using errors.Is() and errors.As() for more robust error handling.',
        file: fileDiff.newPath,
        confidence: 0.4
      });
    }

    return recommendations;
  }

  /**
   * Get priority recommendations (highest severity first)
   */
  getPriorityRecommendations(recommendations, maxCount = 3) {
    const sorted = recommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    return sorted.slice(0, maxCount);
  }
}

module.exports = GoPerformanceRecommendations;