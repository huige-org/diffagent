/**
 * Advanced TypeScript Classifier - Enhanced analysis for modern TypeScript features
 */
const TypeScriptClassifier = require('./typescriptClassifier');

class TypeScriptAdvancedClassifier extends TypeScriptClassifier {
  constructor(config = {}) {
    super(config);
    // Enhanced patterns for TypeScript 4.0+
    this.advancedPatterns = {
      // Variadic tuple types
      variadicTupleTypes: /\[\.\.\.T,\s*U\]/,
      // Template literal types
      templateLiteralTypes: /`hello\s*\$\{.*\}`/,
      // Key remapping in mapped types
      keyRemapping: /\[K\s+in\s+keyof\s+T\s+as\s+NewKey<K>\]/,
      // Recursive conditional types
      recursiveConditionalTypes: /type\s+\w+\s*<.*>\s*=\s*.*extends.*\?/,
      // Indexed access types with complex expressions
      indexedAccessTypes: /\w+\[.*\]/,
      
      // React 18+ specific patterns
      react18Concurrent: /createRoot\(|hydrateRoot\(/,
      reactServerComponents: /'use server'|'use client'/,
      reactSuspense: /<Suspense/,
      
      // Modern framework patterns
      nextjsAppRouter: /app\/.*\.tsx?/,
      vue3Composition: /setup\(\)|<script\s+setup>/,
      
      // Performance critical patterns
      largeUnionTypes: /\|.*\|.*\|.*\|.*\|/,
      complexIntersectionTypes: /&.*&.*&/,
      excessiveGenerics: /<.*<.*<.*<.*>>>/
    };
  }

  /**
   * Enhanced classify method with advanced TypeScript analysis
   */
  classify(fileDiff) {
    const baseClassification = super.classify(fileDiff);
    
    // Add advanced TypeScript analysis
    const advancedAnalysis = this._analyzeAdvancedTypeScript(fileDiff);
    
    return {
      ...baseClassification,
      typescriptAdvanced: advancedAnalysis,
      confidence: Math.min(baseClassification.confidence + 0.15, 0.98)
    };
  }

  /**
   * Analyze advanced TypeScript patterns
   */
  _analyzeAdvancedTypeScript(fileDiff) {
    const content = this._extractContent(fileDiff);
    const analysis = {
      hasVariadicTupleTypes: false,
      hasTemplateLiteralTypes: false,
      hasKeyRemapping: false,
      hasRecursiveConditionalTypes: false,
      hasReact18Features: false,
      hasNextJSAppRouter: false,
      hasVue3Composition: false,
      performanceConcerns: [],
      modernFrameworkUsage: []
    };

    // Check advanced type system features
    if (this._matchesPattern(content, [this.advancedPatterns.variadicTupleTypes])) {
      analysis.hasVariadicTupleTypes = true;
      analysis.performanceConcerns.push('variadic-tuple-types');
    }
    
    if (this._matchesPattern(content, [this.advancedPatterns.templateLiteralTypes])) {
      analysis.hasTemplateLiteralTypes = true;
    }
    
    if (this._matchesPattern(content, [this.advancedPatterns.keyRemapping])) {
      analysis.hasKeyRemapping = true;
    }
    
    if (this._matchesPattern(content, [this.advancedPatterns.recursiveConditionalTypes])) {
      analysis.hasRecursiveConditionalTypes = true;
      analysis.performanceConcerns.push('recursive-conditional-types');
    }

    // Check React 18+ features
    if (this._matchesPattern(content, [this.advancedPatterns.react18Concurrent])) {
      analysis.hasReact18Features = true;
      analysis.modernFrameworkUsage.push('react-18-concurrent');
    }
    
    if (this._matchesPattern(content, [this.advancedPatterns.reactServerComponents])) {
      analysis.hasReact18Features = true;
      analysis.modernFrameworkUsage.push('react-server-components');
    }

    // Check framework-specific patterns
    if (fileDiff.newPath && this.advancedPatterns.nextjsAppRouter.test(fileDiff.newPath)) {
      analysis.hasNextJSAppRouter = true;
      analysis.modernFrameworkUsage.push('nextjs-app-router');
    }
    
    if (this._matchesPattern(content, [this.advancedPatterns.vue3Composition])) {
      analysis.hasVue3Composition = true;
      analysis.modernFrameworkUsage.push('vue3-composition-api');
    }

    // Performance analysis for complex types
    analysis.performanceConcerns.push(...this._analyzeTypePerformance(content));
    
    return analysis;
  }

  /**
   * Analyze TypeScript type system performance impact
   */
  _analyzeTypePerformance(content) {
    const concerns = [];
    
    // Large union types can slow down type checking
    const unionMatches = content.match(/\|/g) || [];
    if (unionMatches.length > 10) {
      concerns.push('large-union-type');
    }
    
    // Complex intersection types
    const intersectionMatches = content.match(/&/g) || [];
    if (intersectionMatches.length > 5) {
      concerns.push('complex-intersection-type');
    }
    
    // Excessive nested generics
    if (this.advancedPatterns.excessiveGenerics.test(content)) {
      concerns.push('excessive-nested-generics');
    }
    
    return concerns;
  }

  /**
   * Override security analysis with advanced patterns
   */
  _analyzeTypeScriptSecurity(content) {
    const baseIssues = super._analyzeTypeScriptSecurity(content);
    const advancedIssues = [];
    
    // Server Components security considerations
    if (content.includes('use server')) {
      advancedIssues.push({
        type: 'server-component-security',
        severity: 'medium',
        message: 'Server Component detected. Ensure proper input validation and sanitization.',
        suggestion: 'Validate all props passed to Server Components and sanitize any user input.'
      });
    }
    
    return [...baseIssues, ...advancedIssues];
  }

  /**
   * Override performance analysis with advanced patterns
   */
  _analyzeTypeScriptPerformance(content) {
    const baseIssues = super._analyzeTypeScriptPerformance(content);
    const advancedIssues = [];
    
    // Complex type system usage
    if (this.advancedPatterns.largeUnionTypes.test(content)) {
      advancedIssues.push({
        type: 'complex-union-types',
        severity: 'high',
        message: 'Very large union types detected. This may significantly impact compilation performance.',
        suggestion: 'Consider using discriminated unions or breaking large unions into smaller, more manageable pieces.'
      });
    }
    
    if (this.advancedPatterns.complexIntersectionTypes.test(content)) {
      advancedIssues.push({
        type: 'complex-intersection-types',
        severity: 'medium',
        message: 'Complex intersection types detected. This may impact type checking performance.',
        suggestion: 'Consider using interfaces with extends instead of complex intersection types.'
      });
    }
    
    return [...baseIssues, ...advancedIssues];
  }
}

module.exports = TypeScriptAdvancedClassifier;