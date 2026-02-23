const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple static file server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Serve index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  const filePath = path.join(__dirname, 'src', 'web', pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Handle API requests
      if (req.url === '/analyze' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            // This is a placeholder - in real implementation, 
            // you would call the DiffAgent analyze method here
            const mockResponse = {
              success: true,
              riskScore: { riskScore: 0.5, riskLevel: 'medium' },
              recommendations: [
                {
                  type: 'security',
                  severity: 'medium',
                  message: 'Sample security issue detected',
                  suggestion: 'Apply security best practices',
                  file: 'example.ts'
                }
              ],
              files: [{ newPath: 'example.ts' }]
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mockResponse));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
          }
        });
        return;
      }
      
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    // Determine content type
    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }
    
    // Serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Web interface deployed successfully!`);
  console.log(`🌐 Web interface: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/analyze`);
});