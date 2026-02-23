const { exec } = require('child_process');
const fs = require('fs');

// Start Xvfb virtual display
console.log('Starting Xvfb virtual display...');
exec('Xvfb :99 -screen 0 1280x720x24 &', (error, stdout, stderr) => {
  if (error) {
    console.error('Failed to start Xvfb:', error);
    return;
  }
  
  // Set display
  process.env.DISPLAY = ':99';
  
  // Start FFmpeg recording
  console.log('Starting FFmpeg recording...');
  const ffmpeg = exec('ffmpeg -f x11grab -s 1280x720 -i :99 -c:v libx264 -preset ultrafast -crf 23 -y /tmp/diffagent-demo.mp4', 
    (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg recording failed:', error);
        return;
      }
      console.log('Recording completed successfully!');
    });
  
  // Simulate web interaction after 2 seconds
  setTimeout(() => {
    console.log('Simulating web interaction...');
    
    // Open browser and navigate to web interface
    exec('xdg-open http://localhost:3000', (error, stdout, stderr) => {
      if (error) {
        console.log('Browser not available, simulating API calls instead...');
        
        // Simulate API interaction
        const http = require('http');
        
        // Test health check
        http.get('http://localhost:3000/health', (res) => {
          console.log('Health check successful');
        }).on('error', (e) => {
          console.error('Health check failed:', e);
        });
        
        // Test analysis API
        setTimeout(() => {
          const postData = JSON.stringify({
            diff: 'diff --git a/test.ts b/test.ts\\nindex 123..456\\n--- a/test.ts\\n+++ b/test.ts\\n@@ -1,1 +1,2 @@\\n+const x: any = "test";\\n console.log("hello");'
          });
          
          const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/analyze',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          };
          
          const req = http.request(options, (res) => {
            console.log('Analysis API test completed');
          });
          
          req.on('error', (e) => {
            console.error('Analysis API test failed:', e);
          });
          
          req.write(postData);
          req.end();
        }, 3000);
      }
    });
    
    // Stop recording after 10 seconds
    setTimeout(() => {
      console.log('Stopping recording...');
      ffmpeg.kill('SIGINT');
      
      // Wait a bit for file to be written
      setTimeout(() => {
        // Check if video file exists
        if (fs.existsSync('/tmp/diffagent-demo.mp4')) {
          console.log('✅ Demo video created successfully!');
          console.log('📹 Video location: /tmp/diffagent-demo.mp4');
        } else {
          console.log('❌ Video file not found');
        }
      }, 2000);
    }, 10000);
  }, 2000);
});