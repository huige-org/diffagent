/**
 * TypeScript Classifier - Specialized analysis for TypeScript code
 */
const JavaScriptClassifier = require('./javascriptClassifier');

class TypeScriptClassifier extends JavaScriptClassifier {
  constructor(config = {}) {
    super(config);
    this.typescriptPatterns = {
      // Type safety patterns
      missingTypeAnnotations: /:\s*any|:\s*Object/,
      unsafeTypeAssertions: /as\s+any|<any>/,
      implicitAny: /\w+\s*:\s*\w+\s*=\s*[^;]+;/,
      
      // Interface and type patterns
      interfaceChanges: /interface\s+\w+/,
      typeAliasChanges: /type\s+\w+\s*=/,
      
      // React TypeScript patterns
      reactComponentProps: /React\.FC<|interface\s+\w+Props/,
      reactHookTypes: /useState<|useEffect<|useCallback<|useMemo<|useRef<|useContext<|useReducer<|useCallback<|useMemo<|useRef<|useContext<|useReducer<|useImperativeHandle<|useLayoutEffect<|useDebugValue<|useDeferredValue<|useTransition<|useId<|useSyncExternalStore<|useInsertionEffect/,
      
      // Advanced TypeScript patterns
      genericUsage: /<\w+>/,
      unionTypes: /\|/,
      intersectionTypes: /&/,
      optionalChaining: /\?\.|\?\?/,
      nullishCoalescing: /\?\?/
    };
  }

  /**
   * Enhanced classify method for TypeScript
   */
  classify(fileDiff) {
    const jsClassification = super.classify(fileDiff);
    
    // Enhance with TypeScript-specific analysis
    const tsAnalysis = this._analyzeTypeScriptSpecifics(fileDiff);
    
    return {
      ...jsClassification,
      language: 'typescript',
      typescriptSpecific: tsAnalysis,
      confidence: Math.min(jsClassification.confidence + 0.2, 0.95)
    };
  }

  /**
   * Analyze TypeScript-specific patterns
   */
  _analyzeTypeScriptSpecifics(fileDiff) {
    const content = this._extractContent(fileDiff);
    const analysis = {
      hasTypeAnnotations: false,
      hasInterfaces: false,
      hasTypeAliases: false,
      hasReactComponents: false,
      hasReactHooks: false,
      hasGenerics: false,
      hasUnionTypes: false,
      hasIntersectionTypes: false,
      hasOptionalChaining: false,
      hasNullishCoalescing: false,
      securityIssues: [],
      performanceIssues: [],
      qualityIssues: []
    };

    // Check for type annotations
    if (this._matchesPattern(content, [/:\s*\w+/])) {
      analysis.hasTypeAnnotations = true;
    }

    // Check for interfaces
    if (this._matchesPattern(content, [this.typescriptPatterns.interfaceChanges])) {
      analysis.hasInterfaces = true;
    }

    // Check for type aliases
    if (this._matchesPattern(content, [this.typescriptPatterns.typeAliasChanges])) {
      analysis.hasTypeAliases = true;
    }

    // Check for React components
    if (this._matchesPattern(content, [this.typescriptPatterns.reactComponentProps])) {
      analysis.hasReactComponents = true;
    }

    // Check for React hooks
    if (this._matchesPattern(content, [this.typescriptPatterns.reactHookTypes])) {
      analysis.hasReactHooks = true;
    }

    // Check for generics
    if (this._matchesPattern(content, [this.typescriptPatterns.genericUsage])) {
      analysis.hasGenerics = true;
    }

    // Check for union types
    if (this._matchesPattern(content, [this.typescriptPatterns.unionTypes])) {
      analysis.hasUnionTypes = true;
    }

    // Check for intersection types
    if (this._matchesPattern(content, [this.typescriptPatterns.intersectionTypes])) {
      analysis.hasIntersectionTypes = true;
    }

    // Check for optional chaining
    if (this._matchesPattern(content, [this.typescriptPatterns.optionalChaining])) {
      analysis.hasOptionalChaining = true;
    }

    // Check for nullish coalescing
    if (this._matchesPattern(content, [this.typescriptPatterns.nullishCoalescing])) {
      analysis.hasNullishCoalescing = true;
    }

    // Security analysis
    analysis.securityIssues = this._analyzeTypeScriptSecurity(content);
    
    // Performance analysis  
    analysis.performanceIssues = this._analyzeTypeScriptPerformance(content);
    
    // Quality analysis
    analysis.qualityIssues = this._analyzeTypeScriptQuality(content);

    return analysis;
  }

  /**
   * TypeScript-specific security analysis
   */
  _analyzeTypeScriptSecurity(content) {
    const issues = [];
    
    // Unsafe type assertions
    if (this._matchesPattern(content, [this.typescriptPatterns.unsafeTypeAssertions])) {
      issues.push({
        type: 'unsafe-type-assertion',
        severity: 'medium',
        message: 'Unsafe type assertion detected (as any or <any>)',
        suggestion: 'Use proper type guards or specific types instead of "any"'
      });
    }
    
    // Missing type annotations
    if (this._matchesPattern(content, [this.typescriptPatterns.missingTypeAnnotations])) {
      issues.push({
        type: 'missing-type-annotation',
        severity: 'low',
        message: 'Missing or unsafe type annotations detected',
        suggestion: 'Add proper type annotations to improve type safety'
      });
    }
    
    return issues;
  }

  /**
   * TypeScript-specific performance analysis
   */
  _analyzeTypeScriptPerformance(content) {
    const issues = [];
    
    // Complex generic usage
    const genericMatches = content.match(/<\w+>/g) || [];
    if (genericMatches.length > 5) {
      issues.push({
        type: 'complex-generics',
        severity: 'low',
        message: 'Complex generic usage detected',
        suggestion: 'Consider simplifying generic types for better compilation performance'
      });
    }
    
    return issues;
  }

  /**
   * TypeScript-specific quality analysis
   */
  _analyzeTypeScriptQuality(content) {
    const issues = [];
    
    // Implicit any usage
    if (this._matchesPattern(content, [this.typescriptPatterns.implicitAny])) {
      issues.push({
        type: 'implicit-any',
        severity: 'medium',
        message: 'Implicit any usage detected',
        suggestion: 'Enable strict mode and add explicit type annotations'
      });
    }
    
    // Missing interfaces for props
    if (content.includes('React.FC') && !content.includes('interface')) {
      issues.push({
        type: 'missing-props-interface',
        severity: 'medium',
        message: 'React component props should have explicit interface',
        suggestion: 'Create an interface for component props to improve type safety'
      });
    }
    
    return issues;
  }

  /**
   * Override change type determination for TypeScript
   */
  _determineChangeType(details) {
    // TypeScript-specific change types
    if (details.typescriptSpecific) {
      const ts = details.typescriptSpecific;
      
      // Type safety improvements
      if (ts.hasTypeAnnotations && !ts.securityIssues.length) {
        return 'refactor';
      }
      
      // React component type improvements
      if (ts.hasReactComponents && ts.hasInterfaces) {
        return 'feature';
      }
      
      // Security fixes
      if (ts.securityIssues.length > 0) {
        return 'security_fix';
      }
    }
    
    // Fall back to JavaScript logic
    return super._determineChangeType(details);
  }

  /**
   * Override confidence calculation for TypeScript
   */
  _calculateConfidence(details) {
    let confidence = super._calculateConfidence(details);
    
    // Increase confidence for TypeScript-specific patterns
    if (details.typescriptSpecific) {
      const ts = details.typescriptSpecific;
      if (ts.hasTypeAnnotations) confidence += 0.1;
      if (ts.hasInterfaces) confidence += 0.1;
      if (ts.hasReactComponents) confidence += 0.15;
    }
    
    return Math.min(confidence, 0.95);
  }
}

module.exports = TypeScriptClassifier;