FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖（生产环境）
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 创建非root用户以提高安全性
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# 暴露端口（如果应用需要）
# EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]