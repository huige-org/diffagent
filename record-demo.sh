#!/bin/bash

# 设置虚拟显示
export DISPLAY=:99

# 启动 Xvfb 虚拟显示服务器
Xvfb :99 -screen 0 1920x1080x24 &
XVFB_PID=$!

# 等待 Xvfb 启动
sleep 2

# 开始录制屏幕
ffmpeg -y -f x11grab -s 1920x1080 -i :99 -c:v libx264 -preset ultrafast -pix_fmt yuv420p /root/.openclaw/workspace/codeWorker/diffagent/demo-video.mp4 &
FFMPEG_PID=$!

# 等待录制开始
sleep 2

echo "开始录制演示视频..."

# 使用 curl 模拟 Web 操作
echo "1. 访问 Web 界面"
curl -s http://localhost:3000 > /dev/null

echo "2. 测试 API 端点"
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"diff": "diff --git a/test.ts b/test.ts\nindex 123..456\n--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,2 @@\n+const x: any = \"test\";\n console.log(\"hello\");"}' > /dev/null

echo "3. 检查健康状态"
curl -s http://localhost:3000/health > /dev/null

# 继续录制几秒钟
sleep 5

# 停止录制
kill $FFMPEG_PID
wait $FFMPEG_PID

# 停止 Xvfb
kill $XVFB_PID
wait $XVFB_PID

echo "演示视频已保存到: /root/.openclaw/workspace/codeWorker/diffagent/demo-video.mp4"