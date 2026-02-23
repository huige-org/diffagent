#!/bin/bash

# 创建录制目录
mkdir -p recordings

# 设置显示和录制参数
export DISPLAY=:99
VIDEO_FILE="recordings/diffagent-demo-$(date +%Y%m%d-%H%M%S).mp4"

echo "开始录制到: $VIDEO_FILE"

# 启动虚拟显示（如果未运行）
if ! pgrep -f "Xvfb :99" > /dev/null; then
    Xvfb :99 -screen 0 1920x1080x24 &
    sleep 2
fi

# 使用可用的编码器进行录制
ffmpeg -y \
  -f x11grab \
  -video_size 1920x1080 \
  -framerate 30 \
  -i :99 \
  -c:v libopenh264 \
  -preset ultrafast \
  -crf 23 \
  "$VIDEO_FILE" &

FFMPEG_PID=$!

# 等待录制启动
sleep 3

echo "录制已启动，开始演示操作..."

# 创建简单的演示HTML页面
cat > /tmp/demo.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>DiffAgent Demo</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .demo-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; }
        .result { background: #e8f4f8; padding: 10px; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DiffAgent - Code Analysis Platform</h1>
            <p>Intelligent TypeScript and Go Code Analysis</p>
        </div>
        
        <div class="demo-section">
            <h2>Step 1: Input Git Diff</h2>
            <div class="code">
diff --git a/example.ts b/example.ts<br>
index 123..456<br>
--- a/example.ts<br>
+++ b/example.ts<br>
@@ -1,3 +1,5 @@<br>
+// Unsafe TypeScript code<br>
+const userData: any = getUserInput();<br>
+const password = "hardcoded_password_123";<br>
 function processUser(user) {<br>
-  console.log("Processing user");<br>
+  console.log(`Processing user: ${user.name}`);<br>
 }
            </div>
        </div>
        
        <div class="demo-section">
            <h2>Step 2: Analysis Results</h2>
            <div class="result">
                <strong>Risk Assessment:</strong> Medium (Score: 0.85)<br>
                <strong>Security Issues Found:</strong><br>
                • Explicit "any" type detected<br>
                • Hardcoded credentials detected<br>
                <strong>Recommendations:</strong><br>
                • Replace with specific interface or unknown type<br>
                • Move secrets to environment variables
            </div>
        </div>
        
        <div class="demo-section">
            <h2>Step 3: Go Code Analysis</h2>
            <div class="code">
diff --git a/concurrent.go b/concurrent.go<br>
index abc..def<br>
--- a/concurrent.go<br>
+++ b/concurrent.go<br>
@@ -1,5 +1,8 @@<br>
 package main<br>
 <br>
+import "time"<br>
+<br>
 func processData() {<br>
+  go func() {<br>
+    time.Sleep(1 * time.Second)<br>
+  }()<br>
   // Process data here<br>
 }
            </div>
            <div class="result">
                <strong>Go Analysis Result:</strong><br>
                • Potential goroutine leak detected<br>
                • Recommendation: Ensure proper context cancellation
            </div>
        </div>
    </div>
</body>
</html>
EOF

# 在虚拟显示中打开演示页面
DISPLAY=:99 firefox /tmp/demo.html &

# 等待演示完成
sleep 15

# 停止录制
kill $FFMPEG_PID
wait $FFMPEG_PID

echo "录制完成！视频文件: $VIDEO_FILE"

# 检查文件是否存在
if [ -f "$VIDEO_FILE" ]; then
    echo "✅ 视频录制成功！"
    ls -lh "$VIDEO_FILE"
else
    echo "❌ 视频录制失败"
fi