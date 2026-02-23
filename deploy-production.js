/**
 * Production Deployment Script for DiffAgent
 * Starts the HTTP server with memory database (since Docker is not available)
 */

const http = require('http');
const url = require('url');
const DiffAgent = require('./src/index');
const fs = require('fs');

// Create agent with memory database
const agent = new DiffAgent({
  database: {
    enabled: true,
    mode: 'memory'
  },
  cache: {
    enabled: false
  }
});

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/analyze') {
    // Analyze endpoint
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const diffContent = JSON.parse(body).diff;
        if (!diffContent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing diff content' }));
          return;
        }
        
        console.log('🔍 Analyzing diff...');
        const result = await agent.analyze(diffContent, { userId: 'web-user' });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('❌ Analysis error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'memory',
      version: '1.0.0'
    }));
  } else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    // Simple web interface
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>DiffAgent - Code Analysis</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            textarea { width: 100%; height: 300px; margin: 10px 0; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            pre { background: #eee; padding: 10px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>DiffAgent - Intelligent Code Analysis</h1>
        <p>Enter your git diff below and click "Analyze" to get intelligent recommendations.</p>
        
        <textarea id="diffInput" placeholder="Paste your git diff here...">diff --git a/test.ts b/test.ts
index 1234567..89abcdef 100644
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,5 @@
+// New TypeScript file
+const x: any = 'test';
 function hello() {
-  console.log('hello');
+  console.log('hello world');
 }
</textarea>
        <br>
        <button onclick="analyzeDiff()">Analyze</button>
        <button onclick="clearResult()">Clear</button>
        
        <div id="result" class="result" style="display:none;">
            <h3>Analysis Result:</h3>
            <pre id="resultText"></pre>
        </div>

        <script>
            async function analyzeDiff() {
                const diff = document.getElementById('diffInput').value;
                const resultDiv = document.getElementById('result');
                const resultText = document.getElementById('resultText');
                
                try {
                    const response = await fetch('/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ diff })
                    });
                    
                    const result = await response.json();
                    resultText.textContent = JSON.stringify(result, null, 2);
                    resultDiv.style.display = 'block';
                } catch (error) {
                    resultText.textContent = 'Error: ' + error.message;
                    resultDiv.style.display = 'block';
                }
            }
            
            function clearResult() {
                document.getElementById('result').style.display = 'none';
            }
        </script>
    </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DiffAgent deployed successfully!`);
  console.log(`🌐 Web interface: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/analyze`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database mode: memory (development)`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await agent.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await agent.close();
    process.exit(0);
  });
});