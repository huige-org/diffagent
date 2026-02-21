/**
 * Utility functions for DiffAgent
 */

/**
 * Calculate code complexity based on cyclomatic complexity principles
 * @param {string} code - Source code to analyze
 * @returns {number} Complexity score
 */
function calculateComplexity(code) {
  if (!code) return 0;
  
  let complexity = 1; // Base complexity
  
  // Count control flow statements
  const controlFlowPatterns = [
    /if\s*\(/g,
    /else\s*{/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /switch\s*\(/g,
    /\.forEach\s*\(/g,
    /\.map\s*\(/g,
    /\.filter\s*\(/g
  ];
  
  controlFlowPatterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  });
  
  // Count function declarations
  const functionPatterns = [
    /function\s+\w+/g,
    /\w+\s*=\s*\([^)]*\)\s*=>/g,
    /const\s+\w+\s*=\s*function/g
  ];
  
  functionPatterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length * 0.5; // Functions add some complexity
  });
  
  return Math.round(complexity * 10) / 10;
}

/**
 * Detect programming language from file extension
 * @param {string} filename - File name with extension
 * @returns {string} Language identifier
 */
function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript', 
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  
  return languageMap[ext] || 'unknown';
}

/**
 * Extract function/method names from code
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {string[]} Array of function names
 */
function extractFunctionNames(code, language) {
  if (!code) return [];
  
  const functions = [];
  
  switch (language) {
    case 'javascript':
    case 'typescript':
      // Match function declarations and arrow functions
      const jsFuncPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>|(\w+)\s*:\s*function)/g;
      let jsMatch;
      while ((jsMatch = jsFuncPattern.exec(code)) !== null) {
        const name = jsMatch[1] || jsMatch[2] || jsMatch[3];
        if (name && !functions.includes(name)) {
          functions.push(name);
        }
      }
      break;
      
    case 'python':
      const pyFuncPattern = /def\s+(\w+)/g;
      let pyMatch;
      while ((pyMatch = pyFuncPattern.exec(code)) !== null) {
        if (!functions.includes(pyMatch[1])) {
          functions.push(pyMatch[1]);
        }
      }
      break;
      
    case 'java':
      const javaFuncPattern = /(?:public|private|protected)?\s*(?:static\s+)?\w+\s+(\w+)\s*\(/g;
      let javaMatch;
      while ((javaMatch = javaFuncPattern.exec(code)) !== null) {
        if (!functions.includes(javaMatch[1])) {
          functions.push(javaMatch[1]);
        }
      }
      break;
      
    default:
      // Generic pattern for other languages
      const genericPattern = /(?:function|def|fun|fn|method)\s+(\w+)/g;
      let genericMatch;
      while ((genericMatch = genericPattern.exec(code)) !== null) {
        if (!functions.includes(genericMatch[1])) {
          functions.push(genericMatch[1]);
        }
      }
  }
  
  return functions;
}

/**
 * Calculate similarity between two code snippets
 * @param {string} code1 - First code snippet
 * @param {string} code2 - Second code snippet
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(code1, code2) {
  if (!code1 || !code2) return 0;
  if (code1 === code2) return 1;
  
  // Simple token-based similarity
  const tokens1 = code1.replace(/[{}();]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  const tokens2 = code2.replace(/[{}();]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const commonTokens = tokens1.filter(token => tokens2.includes(token)).length;
  const totalTokens = Math.max(tokens1.length, tokens2.length);
  
  return commonTokens / totalTokens;
}

module.exports = {
  calculateComplexity,
  detectLanguage,
  extractFunctionNames,
  calculateSimilarity
};