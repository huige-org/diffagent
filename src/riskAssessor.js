class RiskAssessor {
  constructor(config = {}) {
    this.config = {
      riskThreshold: config.riskThreshold || 0.5,
      enableImpactAnalysis: config.enableImpactAnalysis !== false,
      ...config
    };
  }

  assess(parsedDiff, classifications) {
    try {
      if (!parsedDiff || !Array.isArray(parsedDiff.files)) {
        return { riskScore: 0, riskLevel: 'low', details: {} };
      }

      let totalRisk = 0;
      const fileRisks = [];

      parsedDiff.files.forEach((file, index) => {
        // Get the classification for this file
        const classification = classifications[index] || { changeType: 'unknown', confidence: 0 };
        
        const fileRisk = this._assessFileRisk(file, classification);
        fileRisks.push(fileRisk);
        totalRisk += fileRisk.riskScore;
      });

      const averageRisk = parsedDiff.files.length > 0 ? totalRisk / parsedDiff.files.length : 0;
      const riskLevel = this._getRiskLevel(averageRisk);

      return {
        riskScore: averageRisk,
        riskLevel,
        details: {
          fileRisks,
          totalFiles: parsedDiff.files.length
        }
      };
    } catch (error) {
      console.error('Error in RiskAssessor:', error);
      return { riskScore: 0, riskLevel: 'low', details: {} };
    }
  }

  _assessFileRisk(file, classification) {
    try {
      const riskFactors = [];
      
      // Get file path - handle both oldPath and newPath
      const filePath = file.newPath || file.oldPath || 'unknown';
      
      // File type risk
      const fileTypeRisk = this._assessFileTypeRisk(filePath);
      riskFactors.push(fileTypeRisk);
      
      // Change type risk
      const changeTypeRisk = this._assessChangeTypeRisk(classification);
      riskFactors.push(changeTypeRisk);
      
      // Size risk (lines changed)
      const sizeRisk = this._assessSizeRisk(file);
      riskFactors.push(sizeRisk);
      
      // Calculate weighted average
      const totalRisk = riskFactors.reduce((sum, risk) => sum + risk, 0);
      const averageRisk = riskFactors.length > 0 ? totalRisk / riskFactors.length : 0;
      
      return {
        filePath,
        riskScore: averageRisk,
        riskFactors: {
          fileType: fileTypeRisk,
          changeType: changeTypeRisk,
          size: sizeRisk
        }
      };
    } catch (error) {
      console.error('Error assessing file risk:', error);
      return { filePath: 'unknown', riskScore: 0, riskFactors: {} };
    }
  }

  _assessFileTypeRisk(filePath) {
    try {
      if (!filePath || filePath === 'unknown') {
        return 0.1; // Low risk for unknown files
      }
      
      const extension = filePath.split('.').pop().toLowerCase();
      
      // High risk file types
      const highRiskExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go', 'rs'];
      const mediumRiskExtensions = ['json', 'yml', 'yaml', 'xml', 'html', 'css'];
      const lowRiskExtensions = ['md', 'txt', 'gitignore', 'dockerfile'];
      
      if (highRiskExtensions.includes(extension)) {
        return 0.8;
      } else if (mediumRiskExtensions.includes(extension)) {
        return 0.5;
      } else if (lowRiskExtensions.includes(extension)) {
        return 0.2;
      } else {
        return 0.3; // Default risk
      }
    } catch (error) {
      console.error('Error assessing file type risk:', error);
      return 0.1;
    }
  }

  _assessChangeTypeRisk(classification) {
    try {
      const changeType = classification.changeType || 'unknown';
      const confidence = classification.confidence || 0;
      
      // Risk based on change type
      const changeTypeRisks = {
        'bug_fix': 0.3,      // Low risk - fixing bugs
        'feature': 0.7,      // Medium-high risk - new features
        'refactor': 0.6,     // Medium risk - refactoring
        'security': 0.9,     // High risk - security changes
        'performance': 0.8,  // High risk - performance changes
        'dependency': 0.7,   // Medium-high risk - dependency changes
        'documentation': 0.1, // Very low risk - docs only
        'test': 0.2,         // Low risk - test changes
        'other': 0.4,        // Medium risk - other changes
        'unknown': 0.5       // Default medium risk
      };
      
      const baseRisk = changeTypeRisks[changeType] || 0.5;
      
      // Adjust risk based on confidence
      // Higher confidence = more accurate risk assessment
      const adjustedRisk = baseRisk * (0.5 + confidence * 0.5);
      
      return Math.min(adjustedRisk, 1.0);
    } catch (error) {
      console.error('Error assessing change type risk:', error);
      return 0.5;
    }
  }

  _assessSizeRisk(file) {
    try {
      const additions = file.additions || 0;
      const deletions = file.deletions || 0;
      const totalChanges = additions + deletions;
      
      if (totalChanges === 0) return 0.1;
      if (totalChanges <= 10) return 0.3;
      if (totalChanges <= 50) return 0.6;
      if (totalChanges <= 100) return 0.8;
      return 0.9; // Large changes are high risk
    } catch (error) {
      console.error('Error assessing size risk:', error);
      return 0.5;
    }
  }

  _getRiskLevel(riskScore) {
    if (riskScore >= 0.7) return 'high';
    if (riskScore >= 0.4) return 'medium';
    return 'low';
  }
}

module.exports = RiskAssessor;