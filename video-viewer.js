const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'src/web')));
app.use('/recordings', express.static(path.join(__dirname, 'recordings')));

// 视频查看页面
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/web/video.html'));
});

// 获取所有录制的视频
app.get('/api/videos', (req, res) => {
  const recordingsDir = path.join(__dirname, 'recordings');
  
  try {
    if (!fs.existsSync(recordingsDir)) {
      return res.json({ videos: [] });
    }
    
    const files = fs.readdirSync(recordingsDir);
    const videoFiles = files
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'))
      .map(file => ({
        name: file,
        url: `/recordings/${file}`,
        size: fs.statSync(path.join(recordingsDir, file)).size,
        date: fs.statSync(path.join(recordingsDir, file)).mtime
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ videos: videoFiles });
  } catch (error) {
    console.error('Error reading recordings directory:', error);
    res.status(500).json({ error: 'Failed to read recordings' });
  }
});

// 主页重定向到视频页面
app.get('/', (req, res) => {
  res.redirect('/video');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎥 Video Viewer Server running on http://10.0.0.5:${PORT}`);
  console.log(`📹 Video page: http://10.0.0.5:${PORT}/video`);
  console.log(`📁 Recordings directory: ${path.join(__dirname, 'recordings')}`);
});