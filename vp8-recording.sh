#!/bin/bash

# 创建录制目录
mkdir -p recordings
OUTPUT_FILE="recordings/diffagent-demo-$(date +%Y%m%d-%H%M%S).webm"

echo "开始录制到: $OUTPUT_FILE"

# 启动虚拟显示
Xvfb :99 -screen 0 1920x1080x24 &
XVFB_PID=$!

# 等待 Xvfb 启动
sleep 3

# 设置显示环境
export DISPLAY=:99

# 启动 Web 服务器（如果还没运行）
if ! pgrep -f "deploy-web" > /dev/null; then
    echo "启动 Web 服务器..."
    nohup node deploy-web-simple.js > web-server.log 2>&1 &
    WEB_SERVER_PID=$!
    sleep 5
fi

# 使用 FFmpeg 录制屏幕，使用 VP8 编码器
echo "录制已启动，开始演示操作..."

# 创建一个简单的 HTML 页面来模拟操作
cat > /tmp/demo.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>DiffAgent Demo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .highlight { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
        .success { background: #d4edda; border-left-color: #28a745; }
        .error { background: #f8d7da; border-left-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DiffAgent - Code Analysis Platform</h1>
            <p>Intelligent TypeScript and Go Code Analysis</p>
        </div>
        
        <div class="content">
            <h2>Demo: TypeScript Security Analysis</h2>
            <div class="highlight">
                <strong>Input Diff:</strong>
                <pre>diff --git a/example.ts b/example.ts
const userData: any = getUserInput();
const password = "hardcoded_password_123";</pre>
            </div>
            
            <div class="highlight success">
                <strong>Analysis Results:</strong>
                <ul>
                    <li><strong>Security Issue:</strong> Explicit 'any' type detected</li>
                    <li><strong>Security Issue:</strong> Hardcoded credentials detected</li>
                    <li><strong>Risk Level:</strong> HIGH</li>
                </ul>
            </div>
            
            <div class="highlight">
                <strong>Recommendations:</strong>
                <ul>
                    <li>Replace 'any' with specific interface or unknown type</li>
                    <li>Move secrets to environment variables</li>
                </ul>
            </div>
        </div>
        
        <div class="content">
            <h2>Demo: Go Concurrency Analysis</h2>
            <div class="highlight">
                <strong>Input Diff:</strong>
                <pre>diff --git a/concurrent.go b/concurrent.go
go func() {
    time.Sleep(1 * time.Second)
}()</pre>
            </div>
            
            <div class="highlight error">
                <strong>Analysis Results:</strong>
                <ul>
                    <li><strong>Concurrency Issue:</strong> Potential goroutine leak detected</li>
                    <li><strong>Risk Level:</strong> MEDIUM</li>
                </ul>
            </div>
            
            <div class="highlight">
                <strong>Recommendations:</strong>
                <ul>
                    <li>Ensure proper context cancellation and cleanup</li>
                    <li>Use worker pools for controlled concurrency</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
EOF

# 使用 xdg-open 或直接用浏览器打开（如果可用）
# 由于没有浏览器，我们直接录制桌面显示

# 启动一个简单的 HTTP 服务器来显示 demo
cd /tmp && python3 -m http.server 8080 &
HTTP_SERVER_PID=$!

# 等待 HTTP 服务器启动
sleep 2

# 使用 FFmpeg 录制，使用 VP8 编码器
timeout 30s ffmpeg -y \
    -f x11grab \
    -video_size 1920x1080 \
    -framerate 15 \
    -i :99 \
    -c:v libvpx \
    -b:v 2M \
    -crf 10 \
    -auto-alt-ref 0 \
    "$OUTPUT_FILE" &

FFMPEG_PID=$!

# 等待录制完成
sleep 25

# 停止录制
kill $FFMPEG_PID 2>/dev/null
wait $FFMPEG_PID 2>/dev/null

# 清理进程
kill $XVFB_PID 2>/dev/null
kill $HTTP_SERVER_PID 2>/dev/null
if [ -n "$WEB_SERVER_PID" ]; then
    kill $WEB_SERVER_PID 2>/dev/null
fi

# 检查录制文件
if [ -f "$OUTPUT_FILE" ]; then
    echo "✅ 录制完成: $OUTPUT_FILE"
    echo "文件大小: $(du -h "$OUTPUT_FILE" | cut -f1)"
else
    echo "❌ 录制失败: 文件未生成"
fi