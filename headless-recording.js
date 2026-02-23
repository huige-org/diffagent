const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function recordDemo() {
  console.log('🚀 Starting headless browser recording...');
  
  // Ensure recordings directory exists
  const recordingsDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }
  
  const videoPath = path.join(recordingsDir, `diffagent-headless-demo-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`);
  
  try {
    // Launch browser in headless mode with video recording
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create context with video recording enabled
    const context = await browser.newContext({
      recordVideo: {
        dir: recordingsDir,
        size: { width: 1280, height: 720 }
      },
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Navigate to the web interface
    console.log('🌐 Navigating to web interface...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Fill the diff input with sample content
    console.log('📝 Entering sample diff content...');
    await page.fill('#diffInput', `diff --git a/example.ts b/example.ts
index 123..456
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,5 @@
+// Unsafe TypeScript code with security issues
+const userData: any = getUserInput();
+const password = "hardcoded_password_123";
 function processUser(user) {
-  console.log("Processing user");
+  console.log(\`Processing user: \${user.name}\`);
 }`);
    
    // Click analyze button
    console.log('🔍 Clicking analyze button...');
    await page.click('#analyzeBtn');
    
    // Wait for results to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot for verification
    await page.screenshot({ path: path.join(recordingsDir, 'final-result.png') });
    
    // Close context and browser
    await context.close();
    await browser.close();
    
    console.log(`✅ Recording completed! Video saved to: ${videoPath}`);
    
    // List all files in recordings directory
    const files = fs.readdirSync(recordingsDir);
    console.log('📁 Recordings directory contents:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(recordingsDir, file));
      console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
    
  } catch (error) {
    console.error('❌ Recording failed:', error.message);
    throw error;
  }
}

// Run the recording
recordDemo().catch(console.error);