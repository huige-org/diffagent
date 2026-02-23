const { chromium } = require('playwright');
const fs = require('fs').promises;

async function recordDemo() {
  console.log('🚀 Starting Playwright recording...');
  
  // Launch browser in headless mode with video recording
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create a new context with video recording enabled
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './recordings',
      size: { width: 1920, height: 1080 }
    }
  });
  
  try {
    // Create a new page
    const page = await context.newPage();
    
    // Navigate to the DiffAgent web interface
    console.log('🌐 Navigating to web interface...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Fill in the diff input with test content
    console.log('📝 Entering test diff content...');
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
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    // Click the analyze button
    console.log('🔍 Clicking analyze button...');
    await page.click('#analyzeBtn');
    
    // Wait for analysis to complete
    await page.waitForTimeout(3000);
    
    // Wait a bit more to show results
    await page.waitForTimeout(2000);
    
    console.log('✅ Recording completed successfully!');
    
  } catch (error) {
    console.error('❌ Recording failed:', error);
  } finally {
    // Close the browser
    await context.close();
    await browser.close();
    
    // List recording files
    try {
      const files = await fs.readdir('./recordings');
      console.log('📁 Recording files:', files);
    } catch (err) {
      console.log('No recording files found');
    }
  }
}

// Ensure recordings directory exists
fs.mkdir('./recordings', { recursive: true })
  .then(() => recordDemo())
  .catch(console.error);