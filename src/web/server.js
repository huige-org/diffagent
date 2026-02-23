const express = require('express');
const path = require('path');
const cors = require('cors');

class WebServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initMiddleware();
    this.initRoutes();
  }

  initMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(express.static(path.join(__dirname, '.'), {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
      }
    }));
    
    // Serve recordings directory
    this.app.use('/recordings', express.static(path.join(__dirname, '..', 'recordings'), {
      maxAge: '1h'
    }));
  }

  initRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'diffagent-web',
        version: '1.0.0'
      });
    });

    // API endpoint for analysis
    this.app.post('/api/analyze', async (req, res) => {
      try {
        const { diff, userId } = req.body;
        if (!diff) {
          return res.status(400).json({ 
            success: false,
            error: '缺少 Git diff 内容'
          });
        }
        
        // This would integrate with the actual DiffAgent
        // For now, return mock response with Chinese messages
        const mockResponse = {
          success: true,
          riskScore: { 
            riskScore: Math.random() * 0.8 + 0.2,
            riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            details: {
              security: Math.random() * 0.9,
              performance: Math.random() * 0.8,
              quality: Math.random() * 0.7
            }
          },
          recommendations: [
            {
              type: 'security',
              severity: 'high',
              message: '检测到硬编码的密码或密钥',
              suggestion: '请将敏感信息移至环境变量或使用安全的密钥管理服务',
              file: 'src/config.ts',
              language: 'typescript'
            },
            {
              type: 'performance',
              severity: 'medium',
              message: '发现潜在的性能瓶颈',
              suggestion: '考虑使用缓存或优化算法复杂度',
              file: 'src/utils/processor.go',
              language: 'go'
            },
            {
              type: 'quality',
              severity: 'low',
              message: '代码可读性有待提升',
              suggestion: '添加详细的注释和文档说明',
              file: 'src/components/Button.tsx',
              language: 'typescript'
            }
          ],
          files: [
            { newPath: 'src/config.ts', classification: { changeType: 'security_fix', language: 'typescript', confidence: 0.95 } },
            { newPath: 'src/utils/processor.go', classification: { changeType: 'performance_optimization', language: 'go', confidence: 0.88 } },
            { newPath: 'src/components/Button.tsx', classification: { changeType: 'feature', language: 'typescript', confidence: 0.92 } }
          ],
          changeTypes: {
            security_fix: 1,
            performance_optimization: 1,
            feature: 1
          },
          analyzedAt: new Date().toISOString()
        };
        
        res.json(mockResponse);
      } catch (error) {
        console.error('分析错误:', error);
        res.status(500).json({ 
          success: false,
          error: '代码分析失败，请稍后重试'
        });
      }
    });

    // Video viewing page
    this.app.get('/videos', (req, res) => {
      res.sendFile(path.join(__dirname, 'videos.html'));
    });

    // Root serves main index
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`✅ Web 界面部署成功！`);
        console.log(`🌐 Web 界面: http://localhost:${this.port}`);
        console.log(`📡 API 端点: http://localhost:${this.port}/api/analyze`);
        console.log(`🎥 演示视频: http://localhost:${this.port}/videos`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = WebServer;