/**
 * Change Classifier - Analyzes code changes and categorizes them
 */
class ChangeClassifier {
  constructor() {
    // Define patterns for different change types
    this.patterns = {
      bug_fix: [
        /fix/i,
        /bug/i,
        /error/i,
        /handle.*null/i,
        /boundary/i,
        /edge.*case/i,
        /defensive/i,
        /validate/i
      ],
      feature: [
        /add/i,
        /new/i,
        /implement/i,
        /create/i,
        /feature/i,
        /support/i,
        /introduce/i
      ],
      refactor: [
        /refactor/i,
        /rename/i,
        /restructure/i,
        /cleanup/i,
        /improve/i,
        /optimize/i,
        /performance/i
      ],
      documentation: [
        /doc/i,
        /comment/i,
        /readme/i,
        /documentation/i,
        /typo/i
      ],
      test: [
        /test/i,
        /spec/i,
        /assert/i,
        /jest/i,
        /mocha/i,
        /chai/i
      ]
    };
  }

  /**
   * Classify a single file's changes
   * @param {Object} file - Parsed file object from diff parser
   * @returns {Object} Classification result
   */
  classifyFile(file) {
    if (!file || !file.hunks) {
      return {
        changeType: 'unknown',
        confidence: 0,
        details: {
          addedLines: 0,
          removedLines: 0,
          totalChanges: 0
        }
      };
    }

    // Count actual changes
    let addedLines = 0;
    let removedLines = 0;
    let content = '';

    file.hunks.forEach(hunk => {
      hunk.lines.forEach(line => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          addedLines++;
          content += line.substring(1) + ' ';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          removedLines++;
          content += line.substring(1) + ' ';
        }
      });
    });

    const totalChanges = addedLines + removedLines;
    
    // If no actual changes, return no-change
    if (totalChanges === 0) {
      return {
        changeType: 'no-change',
        confidence: 1,
        details: { addedLines, removedLines, totalChanges }
      };
    }

    // Analyze content for patterns
    const contentLower = content.toLowerCase();
    let bestMatch = { type: 'other', score: 0 };

    for (const [type, patterns] of Object.entries(this.patterns)) {
      let score = 0;
      patterns.forEach(pattern => {
        if (pattern.test(contentLower)) {
          score += 1;
        }
      });
      
      if (score > bestMatch.score) {
        bestMatch = { type, score };
      }
    }

    // Fallback logic based on change characteristics
    if (bestMatch.score === 0) {
      // Check if it's likely a bug fix (adding null checks, validation, etc.)
      if (content.includes('|| 0') || content.includes('||') || 
          content.includes('validate') || content.includes('check') ||
          addedLines > removedLines) {
        bestMatch = { type: 'bug_fix', score: 0.6 };
      }
      // Check if it's likely a feature (adding new functions)
      else if (content.includes('function ') || content.includes('const ') ||
               content.includes('let ') || content.includes('var ')) {
        bestMatch = { type: 'feature', score: 0.5 };
      }
    }

    const confidence = bestMatch.score > 0 ? 
      Math.min(0.9, bestMatch.score / 2) : 
      (bestMatch.type === 'bug_fix' || bestMatch.type === 'feature' ? 0.4 : 0.3);

    return {
      changeType: bestMatch.type,
      confidence: confidence,
      details: { addedLines, removedLines, totalChanges, content }
    };
  }

  /**
   * Classify all files in a diff
   * @param {Object} parsedDiff - Parsed diff object
   * @returns {Array} Array of classification results
   */
  classify(parsedDiff) {
    if (!parsedDiff || !parsedDiff.files) {
      return [];
    }

    return parsedDiff.files.map(file => this.classifyFile(file));
  }
}

module.exports = ChangeClassifier;