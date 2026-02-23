const DiffParser = require('./diffParser');
const ChangeClassifier = require('./changeClassifier');
const RiskAssessor = require('./riskAssessor');
const RecommendationGenerator = require('./recommendationGenerator');
const AnalysisSummary = require('./analysisSummary');
const MLIntegrator = require('./mlIntegrator');
const { DatabaseManager } = require('./database/db');
const logger = require('./utils/logger');

class DiffAgent {
  constructor(config = {}) {
    this.parser = new DiffParser();
    this.classifier = new ChangeClassifier();
    this.riskAssessor = new RiskAssessor();
    this.recommendationGenerator = new RecommendationGenerator();
    this.summaryGenerator = new AnalysisSummary();
    this.mlIntegrator = new MLIntegrator(config);
    this.config = config;
    
    // Initialize database manager if database is enabled
    if (this.config.database?.enabled !== false) {
      this.db = new DatabaseManager();
    }
  }

  async analyze(diffContent, options = {}) {
    try {
      // Step 1: Check cache first (if enabled)
      let cacheKey = null;
      if (this.db && this.config.cache?.enabled !== false) {
        cacheKey = this._generateCacheKey(diffContent, options);
        const cachedResult = await this.db.redis.getAnalysisResult(cacheKey);
        if (cachedResult) {
          logger.info('Cache hit for analysis result');
          return JSON.parse(cachedResult);
        }
      }
      
      // Step 2: Parse the diff
      const parsedDiff = this.parser.parse(diffContent);
      
      // Step 3: Classify each file
      const classifiedFiles = parsedDiff.files.map(file => {
        const classification = this.classifier.classifyFile(file);
        return {
          ...file,
          classification
        };
      });
      
      // Step 4: Assess risk (original)
      const riskAssessment = this.riskAssessor.assess(classifiedFiles);
      
      // Step 5: Generate recommendations (original)
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
      
      // Step 6: Apply ML enhancement if enabled and available
      let mlEnhanced = false;
      let finalRiskAssessment = riskAssessment;
      let finalRecommendations = recommendations;
      
      if (this.config.enableML !== false && this.mlIntegrator.isAvailable()) {
        finalRiskAssessment = this.mlIntegrator.enhanceRiskAssessment(classifiedFiles, riskAssessment);
        finalRecommendations = this.mlIntegrator.enhanceRecommendations(recommendations, classifiedFiles);
        mlEnhanced = true;
      }
      
      // Step 7: Generate summary
      const summary = this.summaryGenerator.generate(classifiedFiles, finalRiskAssessment);
      
      // Step 8: Count change types
      const changeTypes = {};
      classifiedFiles.forEach(file => {
        const type = file.classification.changeType;
        changeTypes[type] = (changeTypes[type] || 0) + 1;
      });
      
      const result = {
        success: true,
        error: null,
        summary,
        files: classifiedFiles,
        riskScore: finalRiskAssessment,
        changeTypes,
        recommendations: finalRecommendations,
        mlEnhanced,
        analyzedAt: new Date().toISOString()
      };
      
      // Step 9: Store in database and cache (if enabled)
      if (this.db) {
        try {
          // Store analysis result
          const analysisData = {
            file_path: classifiedFiles.map(f => f.newPath).join(','),
            language: [...new Set(classifiedFiles.map(f => f.classification.language))].join(','),
            change_type: Object.keys(changeTypes).join(','),
            confidence: finalRiskAssessment.riskScore,
            analysis_data: result
          };
          const analysisId = await this.db.saveAnalysisResult(analysisData);
          
          // Store individual recommendations
          await this.db.saveRecommendations(analysisId, finalRecommendations);
          
          logger.info(`Stored analysis result with ID: ${analysisId}`);
          
          // Cache the result
          if (cacheKey && this.config.cache?.enabled !== false) {
            // Note: Redis caching would be implemented here
            logger.info('Caching not implemented yet');
          }
        } catch (dbError) {
          logger.warn('Failed to store analysis result in database:', dbError.message);
          // Don't fail the analysis if database storage fails
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Error in DiffAgent analysis:', error);
      return {
        success: false,
        error: error.message,
        summary: null,
        files: [],
        riskScore: { riskScore: 0, riskLevel: 'low', details: {} },
        changeTypes: {},
        recommendations: [],
        mlEnhanced: false,
        analyzedAt: new Date().toISOString()
      };
    }
  }
  
  _generateCacheKey(diffContent, options) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(diffContent);
    if (options.userId) hash.update(options.userId);
    if (options.configHash) hash.update(options.configHash);
    return `analysis:${hash.digest('hex')}`;
  }
  
  // Cleanup method to close database connections
  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

module.exports = DiffAgent;