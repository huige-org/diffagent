const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

// 速率限制中间件 - 限制 API 请求频率
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: 10, // 每个 IP 最多 10 次请求/分钟
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // 返回 RateLimit-* 头
  legacyHeaders: false, // 禁用 X-RateLimit-* 头
  skipSuccessfulRequests: false,
  // 跳过本地开发环境的限制（可选）
  skip: (req, res) => {
    // 如果需要在开发环境中跳过限制，可以在这里添加条件
    return false;
  }
});

// 全局速率限制 - 防止 DDoS 攻击
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 100, // 每个 IP 最多 100 次请求/15分钟
  message: {
    error: '请求频率过高，已被临时限制',
    code: 'GLOBAL_RATE_LIMIT_EXCEEDED'
  }
});

// 应用全局速率限制到所有路由
app.use(globalLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'src/web')));
app.use('/recordings', express.static(path.join(__dirname, 'recordings')));

// 视频查看页面
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/web/video.html'));
});

// 获取所有录制的视频 - 应用 API 速率限制
app.get('/api/videos', apiLimiter, (req, res) => {
  const recordingsDir = path.join(__dirname, 'recordings');
  
  try {
    // 安全检查：验证目录路径
    if (!recordingsDir.startsWith(path.resolve(__dirname))) {
      return res.status(403).json({ 
        error: '访问被拒绝：无效的目录路径',
        code: 'INVALID_PATH'
      });
    }
    
    if (!fs.existsSync(recordingsDir)) {
      return res.json({ videos: [] });
    }
    
    // 读取文件并过滤
    const files = fs.readdirSync(recordingsDir);
    const videoFiles = files
      .filter(file => {
        // 安全过滤：只允许特定的视频文件扩展名
        const allowedExtensions = ['.webm', '.mp4'];
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
      })
      .map(file => ({
        name: file,
        url: `/recordings/${encodeURIComponent(file)}`, // URL 编码防止 XSS
        size: fs.statSync(path.join(recordingsDir, file)).size,
        date: fs.statSync(path.join(recordingsDir, file)).mtime
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50); // 限制最多返回 50 个视频文件，防止响应过大
    
    // 添加安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    res.json({ videos: videoFiles });
  } catch (error) {
    console.error('Error reading recordings directory:', error);
    
    // 不暴露详细的错误信息给客户端
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '录制目录不存在' });
    } else if (error.code === 'EACCES') {
      res.status(403).json({ error: '访问权限不足' });
    } else {
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
});

// 主页重定向到视频页面
app.get('/', (req, res) => {
  res.redirect('/video');
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎥 Video Viewer Server running on http://10.0.0.5:${PORT}`);
  console.log(`📹 Video page: http://10.0.0.5:${PORT}/video`);
  console.log(`📁 Recordings directory: ${path.join(__dirname, 'recordings')}`);
  console.log(`🛡️ 速率限制已启用：API 接口 10次/分钟，全局 100次/15分钟`);
});