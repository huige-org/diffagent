# DiffAgent

[![English](https://img.shields.io/badge/English-Documentation-blue?style=flat-square)](#english-documentation)

一个智能代理，用于分析、处理和响应代码差异（diffs）。

An intelligent agent for analyzing, processing, and acting on code diffs.

## 📋 功能特性 (Features)

### 中文功能列表
- **Git 差异解析** - 解析 Git diff 和补丁文件
- **代码变更分析** - 分析代码变更中的模式和问题
- **变更摘要生成** - 自动生成人类可读的变更摘要
- **改进建议** - 提供代码改进建议或修复方案
- **版本控制系统集成** - 与 Git 等 VCS 系统无缝集成
- **多语言支持** - 支持 TypeScript、JavaScript、Go、Python、Java 等多种编程语言
- **机器学习增强** - 使用 ML 模型提供更准确的风险评估
- **安全检测** - 识别潜在的安全漏洞和风险
- **性能优化建议** - 提供性能改进的最佳实践
- **Web 界面** - 提供直观的 Web 界面进行交互式分析

### English Features
- **Git Diff Parsing** - Parse Git diffs and patch files
- **Code Change Analysis** - Analyze code changes for patterns and issues  
- **Change Summary Generation** - Generate human-readable summaries of changes
- **Improvement Suggestions** - Suggest improvements or fixes
- **VCS Integration** - Integrate with version control systems like Git
- **Multi-language Support** - Support TypeScript, JavaScript, Go, Python, Java, and more
- **ML Enhancement** - Use ML models for more accurate risk assessment
- **Security Scanning** - Detect potential security vulnerabilities and risks
- **Performance Optimization** - Provide performance improvement best practices
- **Web Interface** - Interactive web interface for analysis

## 🏗️ 项目架构 (Architecture)

```
diffagent/
├── src/
│   ├── core/           # 核心 diff 解析和分析逻辑 / Core diff parsing and analysis logic
│   ├── agents/         # 不同类型的代理（摘要器、审查器等）/ Different agent types (summarizer, reviewer, etc.)
│   ├── integrations/   # VCS 和 CI/CD 集成 / VCS and CI/CD integrations
│   ├── utils/          # 工具函数 / Utility functions
│   └── cli/            # 命令行界面 / Command line interface
├── tests/              # 单元测试和集成测试 / Unit and integration tests
├── examples/           # 使用示例 / Usage examples
└── docs/               # 文档 / Documentation
```

## 🚀 快速开始 (Getting Started)

### 中文快速开始指南

1. **安装依赖**:
```bash
npm install
```

2. **运行 CLI**:
```bash
npm run cli -- --help
```

3. **运行测试**:
```bash
npm test
```

4. **启动 Web 界面**:
```bash
npm start
```
然后访问 `http://localhost:3000`

### English Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run the CLI**:
```bash
npm run cli -- --help
```

3. **Run tests**:
```bash
npm test
```

4. **Start Web Interface**:
```bash
npm start
```
Then visit `http://localhost:3000`

## 🎯 使用场景 (Use Cases)

### 中文使用场景
- **代码审查助手**: 自动审查 Pull Requests
- **变更摘要生成器**: 为提交生成人类可读的摘要
- **安全扫描器**: 检测潜在的危险代码变更
- **风格执行器**: 确保代码变更遵循风格指南
- **迁移助手**: 协助大规模代码迁移
- **CI/CD 集成**: 在持续集成流程中自动分析代码质量

### English Use Cases
- **Code Review Assistant**: Automatically review pull requests
- **Change Summarizer**: Generate human-readable summaries of commits
- **Security Scanner**: Detect potentially dangerous code changes
- **Style Enforcer**: Ensure code changes follow style guidelines
- **Migration Helper**: Assist with large-scale code migrations
- **CI/CD Integration**: Automatically analyze code quality in CI/CD pipelines

## 🤖 机器学习增强 (ML Enhancement)

DiffAgent 集成了机器学习模型来提供更智能的分析：

- **训练数据**: 基于开源项目的实际代码变更数据
- **风险评估**: 结合传统规则和 ML 预测进行综合风险评分
- **智能推荐**: 根据变更类型和上下文提供个性化建议
- **持续学习**: 支持模型更新和重新训练

DiffAgent integrates ML models to provide intelligent analysis:

- **Training Data**: Based on real code changes from open source projects
- **Risk Assessment**: Combined traditional rules and ML predictions for comprehensive scoring
- **Smart Recommendations**: Personalized suggestions based on change type and context
- **Continuous Learning**: Supports model updates and retraining

## 🌐 Web 界面 (Web Interface)

DiffAgent 提供了现代化的 Web 界面：

- **实时分析**: 粘贴 Git diff 后立即获得分析结果
- **可视化报告**: 直观显示风险等级和详细建议
- **多语言支持**: 界面支持中英文切换
- **演示视频**: 提供操作演示视频
- **响应式设计**: 在桌面和移动设备上都能良好显示

DiffAgent provides a modern web interface:

- **Real-time Analysis**: Get analysis results immediately after pasting Git diff
- **Visual Reports**: Intuitive display of risk levels and detailed recommendations
- **Multi-language Support**: Interface supports Chinese/English switching
- **Demo Videos**: Operation demonstration videos available
- **Responsive Design**: Works well on both desktop and mobile devices

## 📦 部署选项 (Deployment Options)

### 本地部署 (Local Deployment)
```bash
git clone https://github.com/your-username/diffagent.git
cd diffagent
npm install
npm start
```

### Docker 部署 (Docker Deployment)
```bash
docker build -t diffagent .
docker run -p 3000:3000 diffagent
```

### 云部署 (Cloud Deployment)
支持部署到各种云平台，包括腾讯云、阿里云、AWS 等。

Supports deployment to various cloud platforms including Tencent Cloud, Alibaba Cloud, AWS, etc.

## 📝 贡献指南 (Contributing)

我们欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与。

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved.

## 📄 许可证 (License)

MIT License - 详情请见 [LICENSE](LICENSE) 文件。

MIT License - See [LICENSE](LICENSE) file for details.

---

## English Documentation

<details>
<summary>Click here to expand English documentation</summary>

# DiffAgent

An intelligent agent for analyzing, processing, and acting on code diffs.

## Features

- Parse Git diffs and patch files
- Analyze code changes for patterns and issues
- Generate summaries of changes
- Suggest improvements or fixes
- Integrate with version control systems
- Support multiple programming languages
- ML enhancement for accurate risk assessment
- Security vulnerability detection
- Performance optimization suggestions
- Web interface for interactive analysis

## Architecture

```
diffagent/
├── src/
│   ├── core/           # Core diff parsing and analysis logic
│   ├── agents/         # Different agent types (summarizer, reviewer, etc.)
│   ├── integrations/   # VCS and CI/CD integrations
│   ├── utils/          # Utility functions
│   └── cli/            # Command line interface
├── tests/              # Unit and integration tests
├── examples/           # Usage examples
└── docs/               # Documentation
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the CLI:
```bash
npm run cli -- --help
```

3. Run tests:
```bash
npm test
```

4. Start Web Interface:
```bash
npm start
```
Then visit `http://localhost:3000`

## Use Cases

- **Code Review Assistant**: Automatically review pull requests
- **Change Summarizer**: Generate human-readable summaries of commits
- **Security Scanner**: Detect potentially dangerous code changes
- **Style Enforcer**: Ensure code changes follow style guidelines
- **Migration Helper**: Assist with large-scale code migrations
- **CI/CD Integration**: Automatically analyze code quality in CI/CD pipelines

## ML Enhancement

DiffAgent integrates ML models to provide intelligent analysis:

- **Training Data**: Based on real code changes from open source projects
- **Risk Assessment**: Combined traditional rules and ML predictions for comprehensive scoring
- **Smart Recommendations**: Personalized suggestions based on change type and context
- **Continuous Learning**: Supports model updates and retraining

## Web Interface

DiffAgent provides a modern web interface:

- **Real-time Analysis**: Get analysis results immediately after pasting Git diff
- **Visual Reports**: Intuitive display of risk levels and detailed recommendations
- **Multi-language Support**: Interface supports Chinese/English switching
- **Demo Videos**: Operation demonstration videos available
- **Responsive Design**: Works well on both desktop and mobile devices

## Deployment Options

### Local Deployment
```bash
git clone https://github.com/your-username/diffagent.git
cd diffagent
npm install
npm start
```

### Docker Deployment
```bash
docker build -t diffagent .
docker run -p 3000:3000 diffagent
```

### Cloud Deployment
Supports deployment to various cloud platforms including Tencent Cloud, Alibaba Cloud, AWS, etc.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved.

## License

MIT License - See [LICENSE](LICENSE) file for details.

</details>