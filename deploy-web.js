const path = require('path');
const WebServer = require('./src/web/server');

// Initialize and start the web server
async function main() {
  try {
    const server = new WebServer({
      port: process.env.PORT || 3000,
      staticDir: path.join(__dirname, 'src', 'web'),
      database: {
        enabled: true,
        mode: 'memory'
      },
      enableML: true
    });
    
    await server.start();
    console.log('🚀 DiffAgent Web Interface deployed successfully!');
    console.log('🌐 Web interface: http://localhost:3000');
    console.log('📡 API endpoint: http://localhost:3000/api/analyze');
    console.log('💚 Health check: http://localhost:3000/health');
    console.log('💾 Database mode: memory (development)');
  } catch (error) {
    console.error('❌ Failed to start web server:', error.message);
    process.exit(1);
  }
}

main();