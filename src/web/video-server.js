const express = require('express');
const path = require('path');
const fs = require('fs');

class VideoServer {
  constructor(app, recordingsDir) {
    this.app = app;
    this.recordingsDir = recordingsDir;
    this.initRoutes();
  }

  initRoutes() {
    // Video viewing page
    this.app.get('/video', (req, res) => {
      res.sendFile(path.join(__dirname, 'video.html'));
    });

    // Video files
    this.app.get('/recordings/:filename', (req, res) => {
      const filename = req.params.filename;
      const filePath = path.join(this.recordingsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Video not found');
      }
      
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/webm',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/webm',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    });

    // List all recordings
    this.app.get('/api/recordings', (req, res) => {
      try {
        const files = fs.readdirSync(this.recordingsDir)
          .filter(file => file.endsWith('.webm'))
          .map(file => ({
            name: file,
            url: `/recordings/${file}`,
            size: fs.statSync(path.join(this.recordingsDir, file)).size,
            date: fs.statSync(path.join(this.recordingsDir, file)).mtime
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ recordings: files });
      } catch (error) {
        console.error('Error listing recordings:', error);
        res.status(500).json({ error: 'Failed to list recordings' });
      }
    });
  }
}

module.exports = VideoServer;