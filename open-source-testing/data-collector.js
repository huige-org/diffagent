const fs = require('fs');
const path = require('path');

class OpenSourceDataCollector {
  constructor() {
    this.projects = require('./projects.json');
  }

  /**
   * 收集开源项目的训练数据
   * @returns {Array} 训练数据数组
   */
  collectTrainingData() {
    const trainingData = [];
    
    // 模拟收集过程（实际中会调用 GitHub API）
    for (const [language, projects] of Object.entries(this.projects)) {
      projects.forEach(project => {
        // 模拟分析结果
        const analysisResult = {
          project: project.name,
          language: language,
          filesAnalyzed: Math.floor(Math.random() * 10) + 1,
          recommendations: Math.floor(Math.random() * 8) + 1,
          riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          timestamp: new Date().toISOString()
        };
        trainingData.push(analysisResult);
      });
    }
    
    return trainingData;
  }

  /**
   * 保存训练数据到文件
   * @param {Array} data - 训练数据
   * @param {string} outputPath - 输出路径
   */
  saveTrainingData(data, outputPath = 'training-data.json') {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} training samples to ${outputPath}`);
  }

  /**
   * 获取项目列表
   * @returns {Object} 项目配置
   */
  getProjects() {
    return this.projects;
  }
}

module.exports = OpenSourceDataCollector;