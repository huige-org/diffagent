# DiffAgent Server - Production Deployment

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB RAM, 2 CPU cores

## Deployment Steps

### 1. Build and Start
```bash
cd server
docker-compose up -d
```

### 2. Verify Deployment
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Health check
curl http://localhost:3000/health
```

### 3. Configuration
- Environment variables: `production.env`
- Nginx reverse proxy: `nginx.conf`
- Data persistence: `/app/data`, `/app/logs`

### 4. Scaling
Adjust `MAX_WORKERS` in `production.env` based on available CPU cores.

### 5. Monitoring
- Health endpoint: `/health`
- Logs: `/app/logs`
- Performance metrics available via standard Node.js monitoring tools