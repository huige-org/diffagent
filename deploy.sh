#!/bin/bash

# DiffAgent 部署脚本
echo "🚀 开始部署 DiffAgent 优化版本..."

# 创建部署目录
DEPLOY_DIR="/opt/diffagent-deploy"
mkdir -p $DEPLOY_DIR

# 复制必要的文件
echo "📋 复制源代码文件..."
cp -r src/ $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp config.js $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

# 安装依赖
echo "📦 安装依赖..."
cd $DEPLOY_DIR
npm install --production

# 创建启动脚本
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
cd $(dirname "$0")
node src/index.js
EOF
chmod +x $DEPLOY_DIR/start.sh

# 创建 systemd 服务文件（如果在 Linux 系统上）
if command -v systemctl &> /dev/null; then
    echo "🔧 创建 systemd 服务..."
    cat > /etc/systemd/system/diffagent.service << EOF
[Unit]
Description=DiffAgent Code Analysis Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=$DEPLOY_DIR/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable diffagent.service
    echo "✅ Systemd 服务已创建并启用"
fi

echo "✅ 部署完成！"
echo "📁 部署目录: $DEPLOY_DIR"
echo "📝 启动命令: cd $DEPLOY_DIR && ./start.sh"
if command -v systemctl &> /dev/null; then
    echo "🔄 或使用: systemctl start diffagent"
fi