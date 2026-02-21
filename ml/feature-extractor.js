/**
 * Feature Extractor for ML Model
 * Extracts relevant features from code diffs for machine learning
 */

class FeatureExtractor {
  constructor() {
    this.featureWeights = {
      security: 0.8,
      performance: 0.6,
      quality: 0.5,
      test: 0.7
    };
  }

  /**
   * Extract features from a file diff
   * @param {Object} fileDiff - The file diff object
   * @returns {Object} Extracted features
   */
  extractFeatures(fileDiff) {
    const features = {
      // Basic metrics
      additions: fileDiff.additions || 0,
      deletions: fileDiff.deletions || 0,
      totalChanges: (fileDiff.additions || 0) + (fileDiff.deletions || 0),
      
      // Language detection
      language: this.detectLanguage(fileDiff.newPath),
      
      // Content analysis
      hasSecurityKeywords: this.hasSecurityKeywords(fileDiff),
      hasPerformanceKeywords: this.hasPerformanceKeywords(fileDiff),
      hasTestKeywords: this.hasTestKeywords(fileDiff),
      hasQualityKeywords: this.hasQualityKeywords(fileDiff),
      
      // Pattern matching
      matchesSecurityPatterns: this.matchesSecurityPatterns(fileDiff),
      matchesPerformancePatterns: this.matchesPerformancePatterns(fileDiff),
      matchesTestPatterns: this.matchesTestPatterns(fileDiff),
      matchesQualityPatterns: this.matchesQualityPatterns(fileDiff)
    };

    return features;
  }

  /**
   * Detect programming language from file path
   */
  detectLanguage(filePath) {
    if (!filePath) return 'unknown';
    const ext = filePath.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go'
    };
    return languageMap[ext] || 'unknown';
  }

  /**
   * Check for security-related keywords
   */
  hasSecurityKeywords(fileDiff) {
    const content = this.extractContent(fileDiff);
    const securityKeywords = ['password', 'secret', 'token', 'api_key', 'http:', 'eval(', 'innerHTML'];
    return securityKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check for performance-related keywords
   */
  hasPerformanceKeywords(fileDiff) {
    const content = this.extractContent(fileDiff);
    const performanceKeywords = ['map(', 'filter(', 'reduce(', 'for(', 'while(', 'setTimeout', 'setInterval'];
    return performanceKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check for test-related keywords
   */
  hasTestKeywords(fileDiff) {
    const content = this.extractContent(fileDiff);
    const testKeywords = ['test', 'assert', 'expect', 'describe', 'it(', 'jest', 'pytest', 'junit'];
    return testKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check for quality-related keywords
   */
  hasQualityKeywords(fileDiff) {
    const content = this.extractContent(fileDiff);
    const qualityKeywords = ['todo', 'fixme', 'console.log', 'debugger', 'var ', 'let ', 'const '];
    return qualityKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check for security patterns
   */
  matchesSecurityPatterns(fileDiff) {
    const content = this.extractContent(fileDiff);
    const patterns = [
      /innerHTML\s*=|document\.write\(/,
      /eval\(/,
      /password\s*[:=]\s*['"][^'"]{8,}['"]/,
      /http:/,
      /new Function\(/
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for performance patterns
   */
  matchesPerformancePatterns(fileDiff) {
    const content = this.extractContent(fileDiff);
    const patterns = [
      /find\([^)]*\)\.map\(/,
      /\.map\(|\.filter\(|\.reduce\(/,
      /for\s*\(let\s+\w+\s*=\s*0;\s*\w+\s*<\s*\w+\.length;/
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for test patterns
   */
  matchesTestPatterns(fileDiff) {
    const content = this.extractContent(fileDiff);
    const patterns = [
      /test.*\.js$|.*\.test\.js$/,
      /def test_|class Test/,
      /@Test|public void test/
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for quality patterns
   */
  matchesQualityPatterns(fileDiff) {
    const content = this.extractContent(fileDiff);
    const patterns = [
      /console\.log/,
      /\/\/ TODO:/,
      /\/\/ FIXME:/,
      /debugger;/
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract content from file diff
   */
  extractContent(fileDiff) {
    if (!fileDiff.hunks) return '';
    let content = '';
    fileDiff.hunks.forEach(hunk => {
      if (hunk && hunk.lines) {
        hunk.lines.forEach(line => {
          if (line && typeof line === 'string' && !line.startsWith('---') && !line.startsWith('+++')) {
            content += line.substring(1) + '\n';
          }
        });
      }
    });
    return content;
  }

  /**
   * Calculate feature vector for ML model
   */
  calculateFeatureVector(features) {
    return {
      securityScore: this.calculateSecurityScore(features),
      performanceScore: this.calculatePerformanceScore(features),
      qualityScore: this.calculateQualityScore(features),
      testScore: this.calculateTestScore(features),
      totalChanges: features.totalChanges,
      language: features.language
    };
  }

  /**
   * Calculate security score
   */
  calculateSecurityScore(features) {
    let score = 0;
    if (features.hasSecurityKeywords) score += 0.3;
    if (features.matchesSecurityPatterns) score += 0.5;
    return Math.min(score, 1.0);
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(features) {
    let score = 0;
    if (features.hasPerformanceKeywords) score += 0.2;
    if (features.matchesPerformancePatterns) score += 0.4;
    return Math.min(score, 1.0);
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore(features) {
    let score = 0;
    if (features.hasQualityKeywords) score += 0.2;
    if (features.matchesQualityPatterns) score += 0.3;
    return Math.min(score, 1.0);
  }

  /**
   * Calculate test score
   */
  calculateTestScore(features) {
    let score = 0;
    if (features.hasTestKeywords) score += 0.3;
    if (features.matchesTestPatterns) score += 0.4;
    return Math.min(score, 1.0);
  }
}

module.exports = FeatureExtractor;