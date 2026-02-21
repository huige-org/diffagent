#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const DiffAgent = require('./src');

console.log('🚀 DiffAgent MVP 功能测试');
console.log('='.repeat(50));

// 1. 读取测试 diff 文件
console.log('\n📋 步骤 1: 读取测试输入');
const diffPath = path.join(__dirname, 'examples', 'test-diff.txt');
const diffContent = fs.readFileSync(diffPath, 'utf8');
console.log(`✅ 读取文件: ${diffPath}`);
console.log(`📊 文件大小: ${diffContent.length} 字符`);

// 2. 初始化 DiffAgent
console.log('\n🔧 步骤 2: 初始化 DiffAgent');
const agent = new DiffAgent();
console.log('✅ DiffAgent 实例创建成功');

// 3. 执行分析
console.log('\n🔍 步骤 3: 执行完整分析');
const startTime = Date.now();
const analysis = agent.analyze(diffContent);
const endTime = Date.now();
console.log(`✅ 分析完成 (耗时: ${endTime - startTime}ms)`);

// 4. 展示详细结果
console.log('\n📈 步骤 4: 分析结果详情');
console.log('原始解析结果:');
console.log(JSON.stringify(analysis.parsedDiff, null, 2));

console.log('\n分类结果:');
analysis.files.forEach((file, index) => {
  console.log(`📄 文件 ${index + 1}: ${file.newPath}`);
  console.log(`   变更类型: ${file.classification.changeType}`);
  console.log(`   置信度: ${file.classification.confidence}`);
  console.log(`   添加行数: ${file.additions}`);
  console.log(`   删除行数: ${file.deletions}`);
});

console.log('\n风险评估:');
console.log(`   风险评分: ${analysis.riskScore.riskScore}`);
console.log(`   风险等级: ${analysis.riskScore.riskLevel}`);

console.log('\n变更类型统计:');
Object.entries(analysis.changeTypes).forEach(([type, count]) => {
  console.log(`   ${type}: ${count} 个文件`);
});

console.log('\n📋 最终摘要:');
console.log(JSON.stringify(analysis.summary, null, 2));

// 5. 验证关键指标
console.log('\n✅ 步骤 5: 关键指标验证');
const expectedFiles = 2;
const actualFiles = analysis.files.length;
const bugFixCount = analysis.changeTypes.bug_fix || 0;
const otherCount = analysis.changeTypes.other || 0;

console.log(`预期文件数: ${expectedFiles}, 实际: ${actualFiles} - ${expectedFiles === actualFiles ? '✅' : '❌'}`);
console.log(`预期 bug_fix: 1, 实际: ${bugFixCount} - ${bugFixCount === 1 ? '✅' : '❌'}`);
console.log(`预期 other: 1, 实际: ${otherCount} - ${otherCount === 1 ? '✅' : '❌'}`);
console.log(`风险等级应为 low: ${analysis.riskScore.riskLevel === 'low' ? '✅' : '❌'}`);

console.log('\n🎉 测试完成!');