/**
 * 分类器管理器 - 协调多语言分类器
 */
const LanguageDetector = require('./languageDetector');
const JavaScriptClassifier = require('./classifiers/javascriptClassifier');
const TypeScriptClassifier = require('./classifiers/typescriptClassifier');
const PythonClassifier = require('./classifiers/pythonClassifier');
const JavaClassifier = require('./classifiers/javaClassifier');
const GoClassifier = require('./classifiers/goClassifier');

class ClassifierManager {
  constructor(config = {}) {
    this.config = config;
    this.languageDetector = new LanguageDetector();
    this.classifiers = {
      'javascript': new JavaScriptClassifier(config),
      'typescript': new TypeScriptClassifier(config),
      'python': new PythonClassifier(config),
      'java': new JavaClassifier(config),
      'kotlin': new JavaClassifier(config), // Kotlin 使用 Java 分类器
      'go': new GoClassifier(config)
    };
  }

  /**
   * 根据文件 diff 对象选择合适的分类器
   * @param {Object} fileDiff - 文件 diff 对象
   * @returns {Object} 分类结果
   */
  classifyFile(fileDiff) {
    try {
      // 检测文件语言
      const language = this.languageDetector.detectLanguage(fileDiff.newPath);
      
      // 获取对应的分类器
      const classifier = this.classifiers[language];
      if (classifier) {
        return classifier.classify(fileDiff);
      }
      
      // 如果没有特定分类器，使用通用分类器
      return this._classifyGeneric(fileDiff);
    } catch (error) {
      console.warn(`Classification failed for ${fileDiff.newPath}:`, error.message);
      return this._classifyGeneric(fileDiff);
    }
  }

  /**
   * 通用分类器（回退方案）
   */
  _classifyGeneric(fileDiff) {
    // 基于变更模式的简单分类
    const content = fileDiff.hunks.map(hunk => hunk.lines.join('\n')).join('\n');
    const addedLines = fileDiff.additions || 0;
    const removedLines = fileDiff.deletions || 0;
    const totalChanges = addedLines + removedLines;

    // 简单的启发式分类
    if (totalChanges === 0) {
      return { changeType: 'no-change', confidence: 1.0, details: { addedLines, removedLines, totalChanges, content } };
    }

    // 检查是否包含测试相关关键词
    if (content.toLowerCase().includes('test') || 
        fileDiff.newPath.toLowerCase().includes('test') ||
        fileDiff.newPath.toLowerCase().includes('__tests__')) {
      return { changeType: 'test_addition', confidence: 0.7, details: { addedLines, removedLines, totalChanges, content } };
    }

    // 检查是否包含文档相关关键词
    if (fileDiff.newPath.toLowerCase().endsWith('.md') ||
        fileDiff.newPath.toLowerCase().includes('docs') ||
        fileDiff.newPath.toLowerCase().includes('readme')) {
      return { changeType: 'documentation', confidence: 0.8, details: { addedLines, removedLines, totalChanges, content } };
    }

    // 检查是否包含配置文件
    if (fileDiff.newPath.toLowerCase().endsWith('.json') ||
        fileDiff.newPath.toLowerCase().endsWith('.yml') ||
        fileDiff.newPath.toLowerCase().endsWith('.yaml') ||
        fileDiff.newPath.toLowerCase().endsWith('.toml') ||
        fileDiff.newPath.toLowerCase().includes('package.json') ||
        fileDiff.newPath.toLowerCase().includes('config')) {
      return { changeType: 'config_change', confidence: 0.6, details: { addedLines, removedLines, totalChanges, content } };
    }

    // 默认分类为其他
    return { changeType: 'other', confidence: 0.3, details: { addedLines, removedLines, totalChanges, content } };
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages() {
    return Object.keys(this.classifiers);
  }
}

module.exports = ClassifierManager;