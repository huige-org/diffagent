const express = require('express');
const path = require('path');
const DiffAgent = require('./src/index');

// Initialize DiffAgent
const agent = new DiffAgent({
  database: {
    enabled: true,
    mode: 'memory'
  },
  cache: {
    enabled: false
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'src/web')));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    ml: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { diff } = req.body;
    
    if (!diff) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing diff content' 
      });
    }

    const result = await agent.analyze(diff, { userId: 'web-user' });
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/web/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DiffAgent Web Interface deployed successfully!`);
  console.log(`🌐 Web interface: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/analyze`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database mode: memory (development)`);
});

// Handle shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await agent.close();
  process.exit(0);
});