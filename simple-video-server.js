const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '.')));

// Video page route
app.get('/videos', (req, res) => {
  const videoPath = path.join(__dirname, 'src', 'web', 'videos.html');
  if (fs.existsSync(videoPath)) {
    res.sendFile(videoPath);
  } else {
    res.status(404).send('Video page not found');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'video-server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎥 Video server running on http://10.0.0.5:${PORT}`);
  console.log(`📹 Videos page: http://10.0.0.5:${PORT}/videos`);
});