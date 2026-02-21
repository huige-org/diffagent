const fs = require('fs');
const path = require('path');

// 导入各个模块进行逐步测试
const DiffParser = require('./src/diffParser');
const ChangeClassifier = require('./src/changeClassifier');
const RiskAssessor = require('./src/riskAssessor');
const AnalysisSummary = require('./src/analysisSummary');

console.log('🔍 DiffAgent MVP 数据流程详细分析');
console.log('='.repeat(60));

// 步骤1: 读取输入
const diffPath = path.join(__dirname, 'examples', 'test-diff.txt');
const diffContent = fs.readFileSync(diffPath, 'utf8');
console.log('\n📥 步骤 1: 输入数据');
console.log('原始 diff 内容 (前200字符):');
console.log(diffContent.substring(0, 200) + '...');

// 步骤2: 解析 diff
console.log('\n🔧 步骤 2: Diff 解析');
const parser = new DiffParser();
const parsedDiff = parser.parse(diffContent);
console.log('解析结果结构:');
console.log(`- 文件数量: ${parsedDiff.files.length}`);
console.log(`- 第一个文件: ${parsedDiff.files[0].newPath}`);
console.log(`- 添加行数: ${parsedDiff.files[0].additions}`);
console.log(`- 删除行数: ${parsedDiff.files[0].deletions}`);

// 步骤3: 分类变更
console.log('\n🏷️ 步骤 3: 变更分类');
const classifier = new ChangeClassifier();
const classifiedFiles = parsedDiff.files.map(file => {
    const classification = classifier.classifyFile(file);
    return { ...file, classification };
});
console.log('分类结果:');
classifiedFiles.forEach((file, index) => {
    console.log(`📄 文件 ${index + 1}: ${file.newPath}`);
    console.log(`   类型: ${file.classification.changeType}`);
    console.log(`   置信度: ${file.classification.confidence}`);
});

// 步骤4: 风险评估
console.log('\n⚠️ 步骤 4: 风险评估');
const riskAssessor = new RiskAssessor();
const riskResult = riskAssessor.assess(classifiedFiles);
console.log(`风险评分: ${riskResult.riskScore}`);
console.log(`风险等级: ${riskResult.riskLevel}`);

// 步骤5: 生成摘要
console.log('\n📊 步骤 5: 生成摘要');
const summaryGenerator = new AnalysisSummary();
const summary = summaryGenerator.generate(classifiedFiles, riskResult);
console.log('摘要内容:');
console.log(JSON.stringify(summary, null, 2));

console.log('\n✅ 数据流程分析完成!');