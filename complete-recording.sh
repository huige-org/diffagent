#!/bin/bash

# 设置显示
export DISPLAY=:99

# 启动虚拟显示
Xvfb :99 -screen 0 1920x1080x24 &
XVFB_PID=$!

# 等待虚拟显示启动
sleep 2

# 创建录制目录
mkdir -p /root/.openclaw/workspace/codeWorker/diffagent/recordings
RECORDING_FILE="/root/.openclaw/workspace/codeWorker/diffagent/recordings/diffagent-demo-$(date +%Y%m%d-%H%M%S).mp4"

echo "开始录制到: $RECORDING_FILE"

# 启动 FFmpeg 录制
ffmpeg -y \
  -f x11grab \
  -video_size 1920x1080 \
  -framerate 30 \
  -i :99 \
  -c:v libx264 \
  -preset ultrafast \
  -pix_fmt yuv420p \
  "$RECORDING_FILE" &
FFMPEG_PID=$!

# 等待录制启动
sleep 2

echo "录制已启动，开始演示操作..."

# 这里需要模拟浏览器操作
# 由于没有安装完整的浏览器，我将使用 curl 来演示 API 调用
# 并在虚拟显示中显示终端操作

# 在虚拟显示中运行终端演示
xterm -e "bash -c '
  echo \"=== DiffAgent Web 操作演示 ===\";
  echo \"访问地址: http://10.0.0.5:3000\";
  echo \"\";
  echo \"步骤 1: 测试 TypeScript 分析\";
  curl -s -X POST http://localhost:3000/api/analyze \\
    -H \"Content-Type: application/json\" \\
    -d \"{\\\"diff\\\": \\\"diff --git a/test.ts b/test.ts\\\\nindex 123..456\\\\n--- a/test.ts\\\\n+++ b/test.ts\\\\n@@ -1,1 +1,2 @@\\\\n+const x: any = \\\\\\\"test\\\\\\\";\\\\n console.log(\\\\\\\"hello\\\\\\\");\\\"}\" | python3 -m json.tool;
  echo \"\";
  echo \"步骤 2: 测试 Go 分析\";
  curl -s -X POST http://localhost:3000/api/analyze \\
    -H \"Content-Type: application/json\" \\
    -d \"{\\\"diff\\\": \\\"diff --git a/test.go b/test.go\\\\nindex abc..def\\\\n--- a/test.go\\\\n+++ b/test.go\\\\n@@ -1,3 +1,5 @@\\\\n+package main\\\\n+\\\\n+import \\\\\\\"time\\\\\\\"\\\\n func main() {\\\\n+  go func() { time.Sleep(1 * time.Second) }()\\\\n   fmt.Println(\\\\\\\"hello\\\\\\\");\\\\n }\\\"}\" | python3 -m json.tool;
  echo \"\";
  echo \"演示完成！\";
  sleep 10
'" &

# 等待演示完成
sleep 15

# 停止录制
kill $FFMPEG_PID
wait $FFMPEG_PID

# 停止虚拟显示
kill $XVFB_PID
wait $XVFB_PID

echo "录制完成: $RECORDING_FILE"
echo "文件大小: $(du -h "$RECORDING_FILE")"