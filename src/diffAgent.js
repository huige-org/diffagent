const DiffParser = require('./diffParser');
const ChangeClassifier = require('./changeClassifier');
const RiskAssessor = require('./riskAssessor');
const RecommendationGenerator = require('./recommendationGenerator');
const AnalysisSummary = require('./analysisSummary');

class DiffAgent {
  constructor(config = {}) {
    this.parser = new DiffParser();
    this.classifier = new ChangeClassifier();
    this.riskAssessor = new RiskAssessor();
    this.recommendationGenerator = new RecommendationGenerator();
    this.summaryGenerator = new AnalysisSummary();
  }

  analyze(diffContent) {
    try {
      // Parse the diff
      const parsedDiff = this.parser.parse(diffContent);
      
      // Classify changes for each file
      const classifiedFiles = parsedDiff.files.map(file => {
        const classification = this.classifier.classifyFile(file);
        return {
          ...file,
          classification
        };
      });
      
      // Assess risk
      const riskScore = this.riskAssessor.assess(classifiedFiles);
      
      // Generate recommendations
      const recommendations = this.recommendationGenerator.generateRecommendations(classifiedFiles, riskScore);
      
      // Generate summary
      const summary = this.summaryGenerator.generate(classifiedFiles, riskScore);
      
      // Count change types
      const changeTypes = {};
      classifiedFiles.forEach(file => {
        const type = file.classification.changeType;
        changeTypes[type] = (changeTypes[type] || 0) + 1;
      });
      
      return {
        success: true,
        error: null,
        summary,
        files: classifiedFiles,
        riskScore,
        changeTypes,
        recommendations
      };
    } catch (error) {
      console.error('Error in DiffAgent analysis:', error);
      return {
        success: false,
        error: error.message,
        summary: null,
        files: [],
        riskScore: 0,
        changeTypes: {},
        recommendations: []
      };
    }
  }
}

module.exports = DiffAgent;