class AnalysisSummary {
  generate(analysisResults) {
    const files = analysisResults.files || [];
    
    // 计算总统计
    let totalAdditions = 0;
    let totalDeletions = 0;
    const changeTypes = {};
    
    files.forEach(file => {
      totalAdditions += file.additions || 0;
      totalDeletions += file.deletions || 0;
      
      if (file.classification && file.classification.changeType) {
        const type = file.classification.changeType;
        changeTypes[type] = (changeTypes[type] || 0) + 1;
      }
    });
    
    // 确定主要变更类型
    let primaryChangeType = 'other';
    let maxCount = 0;
    for (const [type, count] of Object.entries(changeTypes)) {
      if (count > maxCount) {
        maxCount = count;
        primaryChangeType = type;
      }
    }
    
    return {
      totalFiles: files.length,
      totalAdditions,
      totalDeletions,
      primaryChangeType,
      changeTypes,
      riskLevel: analysisResults.riskScore?.riskLevel || 'unknown'
    };
  }
}

module.exports = AnalysisSummary;