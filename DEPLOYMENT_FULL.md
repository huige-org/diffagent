# DiffAgent 完整部署指南 - 前后端一体化

## 目录结构
```
diffagent/
├── Dockerfile                 # 基础构建文件
├── docker-compose.full.yml    # 完整前后端编排
├── server/                    # 服务端配置
│   ├── Dockerfile            # 服务端专用Dockerfile
│   ├── nginx.conf           # 服务端Nginx配置
│   ├── production.env       # 生产环境变量
│   └── README.md            # 服务端部署指南
├── frontend/                  # 前端配置
│   ├── Dockerfile           # 前端专用Dockerfile
│   └── nginx.conf          # 前端Nginx配置
└── DEPLOYMENT_FULL.md        # 本文件
```

## 部署步骤

### 1. 构建和启动完整应用
```bash
# 在项目根目录执行
docker-compose -f docker-compose.full.yml up -d --build
```

### 2. 访问应用
- **前端**: http://localhost (端口 80)
- **API**: http://localhost/api/ (代理到后端 3000 端口)
- **健康检查**: http://localhost/health

### 3. 验证部署
```bash
# 检查所有容器状态
docker-compose -f docker-compose.full.yml ps

# 查看日志
docker-compose -f docker-compose.full.yml logs -f

# 健康检查
curl http://localhost/health
curl http://localhost/api/health
```

## 配置说明

### 前端配置
- **静态文件服务**: Nginx 提供高效静态文件服务
- **路由处理**: SPA 路由支持 (try_files)
- **API 代理**: 自动代理 /api/ 请求到后端服务
- **资源优化**: Gzip 压缩，缓存控制

### 后端配置
- **生产优化**: 多阶段构建，非 root 用户运行
- **资源限制**: 1GB 内存，2 CPU 核心
- **数据持久化**: 配置、数据、日志目录挂载
- **安全设置**: 速率限制，内存管理

### 网络架构
- **内部网络**: 前后端通过 Docker 内部网络通信
- **外部访问**: 前端暴露 80 端口，后端仅内部访问
- **负载均衡**: 支持水平扩展后端服务

## 环境变量

### 前端环境变量
- `API_BASE_URL`: API 基础 URL (默认: /api/)
- `NODE_ENV`: 环境模式 (production/development)

### 后端环境变量
- `PORT`: 服务端口 (默认: 3000)
- `MAX_WORKERS`: 工作线程数 (默认: 4)
- `CACHE_SIZE`: 缓存大小 (默认: 100mb)
- `LOG_LEVEL`: 日志级别 (默认: info)

## 扩展和维护

### 水平扩展
```bash
# 扩展后端服务实例
docker-compose -f docker-compose.full.yml up -d --scale diffagent-server=3
```

### 更新应用
```bash
# 重新构建并更新
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up -d --build
```

### 监控和日志
- **日志目录**: ./server/logs/
- **数据目录**: ./server/data/
- **配置目录**: ./config/
- **健康端点**: /health (前端和后端)

## 性能调优

### 内存优化
- 前端: ~100MB 内存占用
- 后端: 512MB-1GB 内存占用
- 缓存: 100MB LRU 缓存

### CPU 优化
- 后端工作线程: 4 个 (可配置)
- Nginx worker 进程: 自动适配 CPU 核心数

此配置适用于生产环境部署，提供完整的前后端一体化解决方案。