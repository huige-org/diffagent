/**
 * 智能推荐引擎 - 协调所有推荐模块
 */
const SecurityRecommendations = require('./securityRecommendations');
const PerformanceRecommendations = require('./performanceRecommendations');
const CodeQualityRecommendations = require('./codeQualityRecommendations');
const TestCoverageRecommendations = require('./testCoverageRecommendations');
const TypeScriptSecurity = require('./typescriptSecurity');
const TypeScriptPerformance = require('./typescriptPerformance');
const TypeScriptQuality = require('./typescriptQuality');
const TypeScriptTest = require('./typescriptTest');
const GoSecurity = require('./goSecurity');
const GoPerformance = require('./goPerformance');
const GoQuality = require('./goQuality');
const GoTest = require('./goTest');

class RecommendationEngine {
  constructor(config = {}) {
    this.config = config;
    this.recommenders = {
      // Generic recommenders
      security: new SecurityRecommendations(config),
      performance: new PerformanceRecommendations(config),
      codeQuality: new CodeQualityRecommendations(config),
      testCoverage: new TestCoverageRecommendations(config),
      
      // TypeScript specific
      typescriptSecurity: new TypeScriptSecurity(config),
      typescriptPerformance: new TypeScriptPerformance(config),
      typescriptQuality: new TypeScriptQuality(config),
      typescriptTest: new TypeScriptTest(config),
      
      // Go specific
      goSecurity: new GoSecurity(config),
      goPerformance: new GoPerformance(config),
      goQuality: new GoQuality(config),
      goTest: new GoTest(config)
    };
  }

  /**
   * Generate complete recommendations based on file analysis
   * @param {Array} classifiedFiles - Array of classified files
   * @param {Object} riskAssessment - Risk assessment results
   * @returns {Array} Complete recommendations array
   */
  generateRecommendations(classifiedFiles, riskAssessment) {
    const recommendations = [];
    
    // Process each file with language-specific recommenders
    classifiedFiles.forEach(file => {
      const language = this._detectLanguage(file.newPath);
      const fileRecommendations = this._generateFileRecommendations(file, language, riskAssessment);
      recommendations.push(...fileRecommendations);
    });
    
    // Add overall recommendations
    const overallRecommendations = this._generateOverallRecommendations(classifiedFiles, riskAssessment);
    recommendations.push(...overallRecommendations);
    
    // Sort by priority and relevance
    return this._sortRecommendations(recommendations);
  }

  /**
   * Generate recommendations for a specific file
   */
  _generateFileRecommendations(file, language, riskAssessment) {
    const recommendations = [];
    
    switch (language) {
      case 'typescript':
        if (this.config.includeSecurityRecommendations !== false) {
          recommendations.push(...this.recommenders.typescriptSecurity.generate(file));
        }
        if (this.config.includePerformanceRecommendations !== false) {
          recommendations.push(...this.recommenders.typescriptPerformance.generate(file));
        }
        if (this.config.includeCodeQualityRecommendations !== false) {
          recommendations.push(...this.recommenders.typescriptQuality.generate(file));
        }
        if (this.config.includeTestCoverageRecommendations !== false) {
          recommendations.push(...this.recommenders.typescriptTest.generate(file));
        }
        break;
        
      case 'go':
        if (this.config.includeSecurityRecommendations !== false) {
          recommendations.push(...this.recommenders.goSecurity.generate(file));
        }
        if (this.config.includePerformanceRecommendations !== false) {
          recommendations.push(...this.recommenders.goPerformance.generate(file));
        }
        if (this.config.includeCodeQualityRecommendations !== false) {
          recommendations.push(...this.recommenders.goQuality.generate(file));
        }
        if (this.config.includeTestCoverageRecommendations !== false) {
          recommendations.push(...this.recommenders.goTest.generate(file));
        }
        break;
        
      default:
        // Use generic recommenders for other languages
        if (this.config.includeSecurityRecommendations !== false) {
          recommendations.push(...this.recommenders.security.generate(file));
        }
        if (this.config.includePerformanceRecommendations !== false) {
          recommendations.push(...this.recommenders.performance.generate(file));
        }
        if (this.config.includeCodeQualityRecommendations !== false) {
          recommendations.push(...this.recommenders.codeQuality.generate(file));
        }
        if (this.config.includeTestCoverageRecommendations !== false) {
          recommendations.push(...this.recommenders.testCoverage.generate(file));
        }
    }
    
    return recommendations;
  }

  /**
   * Generate overall recommendations for the entire diff
   */
  _generateOverallRecommendations(files, riskAssessment) {
    const recommendations = [];
    
    // High-risk overall recommendations
    if (riskAssessment.riskScore > 0.7) {
      recommendations.push({
        type: 'overall',
        severity: 'high',
        category: 'risk',
        message: 'High-risk changes detected across multiple files',
        suggestion: 'Consider comprehensive code review and additional testing',
        confidence: 0.9
      });
    }
    
    // Large diff recommendations
    if (files.length > 10) {
      recommendations.push({
        type: 'overall',
        severity: 'medium',
        category: 'process',
        message: 'Large diff detected (>10 files)',
        suggestion: 'Consider breaking into smaller, more focused pull requests',
        confidence: 0.8
      });
    }
    
    return recommendations;
  }

  /**
   * Detect programming language from file path
   */
  _detectLanguage(filePath) {
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
   * Sort recommendations by priority and relevance
   */
  _sortRecommendations(recommendations) {
    const priorityMap = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    return recommendations.sort((a, b) => {
      const priorityA = priorityMap[a.severity] || priorityMap[a.priority] || 0;
      const priorityB = priorityMap[b.severity] || priorityMap[b.priority] || 0;
      return priorityB - priorityA; // Higher priority first
    });
  }

  /**
   * Get supported recommendation types
   */
  getSupportedRecommendationTypes() {
    return Object.keys(this.recommenders);
  }
}

module.exports = RecommendationEngine;