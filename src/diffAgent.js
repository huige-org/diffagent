const DiffParser = require('./diffParser');
const ChangeClassifier = require('./changeClassifier');
const RiskAssessor = require('./riskAssessor');
const RecommendationGenerator = require('./recommendationGenerator');
const AnalysisSummary = require('./analysisSummary');
const MLIntegrator = require('./mlIntegrator');

class DiffAgent {
  constructor(config = {}) {
    this.parser = new DiffParser();
    this.classifier = new ChangeClassifier();
    this.riskAssessor = new RiskAssessor();
    this.recommendationGenerator = new RecommendationGenerator();
    this.summaryGenerator = new AnalysisSummary();
    this.mlIntegrator = new MLIntegrator(config);
    this.config = config;
  }

  analyze(diffContent) {
    try {
      // Step 1: Parse the diff
      const parsedDiff = this.parser.parse(diffContent);
      
      // Step 2: Classify each file
      const classifiedFiles = parsedDiff.files.map(file => {
        const classification = this.classifier.classifyFile(file);
        return {
          ...file,
          classification
        };
      });
      
      // Step 3: Assess risk (original)
      const riskAssessment = this.riskAssessor.assess(classifiedFiles);
      
      // Step 4: Generate recommendations (original)
      const analysisForRecommendations = {
        files: classifiedFiles,
        riskScore: riskAssessment,
        changeTypes: {}
      };
      classifiedFiles.forEach(file => {
        const type = file.classification.changeType;
        analysisForRecommendations.changeTypes[type] = (analysisForRecommendations.changeTypes[type] || 0) + 1;
      });
      
      const recommendations = this.recommendationGenerator.generateRecommendations(analysisForRecommendations);
      
      // Step 5: Apply ML enhancement if enabled and available
      let mlEnhanced = false;
      let finalRiskAssessment = riskAssessment;
      let finalRecommendations = recommendations;
      
      if (this.config.enableML !== false && this.mlIntegrator.isAvailable()) {
        finalRiskAssessment = this.mlIntegrator.enhanceRiskAssessment(classifiedFiles, riskAssessment);
        finalRecommendations = this.mlIntegrator.enhanceRecommendations(recommendations, classifiedFiles);
        mlEnhanced = true;
      }
      
      // Step 6: Generate summary
      const summary = this.summaryGenerator.generate(classifiedFiles, finalRiskAssessment);
      
      // Step 7: Count change types
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
        riskScore: finalRiskAssessment,
        changeTypes,
        recommendations: finalRecommendations,
        mlEnhanced
      };
    } catch (error) {
      console.error('Error in DiffAgent analysis:', error);
      return {
        success: false,
        error: error.message,
        summary: null,
        files: [],
        riskScore: { riskScore: 0, riskLevel: 'low', details: {} },
        changeTypes: {},
        recommendations: [],
        mlEnhanced: false
      };
    }
  }
}

module.exports = DiffAgent;