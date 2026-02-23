# DiffAgent Database Configuration

## Supported Databases

DiffAgent supports multiple database backends:

- **PostgreSQL** (Recommended) - Full SQL support with JSONB
- **MySQL** - Standard SQL with good performance  
- **MongoDB** - NoSQL document storage
- **Redis** - In-memory caching and session storage

## Configuration Files

### JSON Configuration Files
- `postgres-config.json` - PostgreSQL connection settings
- `mysql-config.json` - MySQL connection settings  
- `mongodb-config.json` - MongoDB connection settings
- `redis-config.json` - Redis cache configuration

### Environment Variables
- `database.env` - All database environment variables
- Supports Docker secrets and external configuration

### Docker Compose
- `docker-compose.db.yml` - Complete database stack deployment
- Includes PostgreSQL, MySQL, MongoDB, and Redis services

## Database Schema

The default schema includes tables for:
- **analysis_results** - Code analysis results with confidence scores
- **code_diffs** - Raw diff data with metadata  
- **recommendations** - Generated suggestions with severity levels
- **user_preferences** - User-specific configuration and preferences

## Deployment Options

### Single Database
Choose one primary database based on your needs:

**PostgreSQL (Recommended):**
```bash
docker-compose -f database/docker-compose.db.yml up -d postgres
```

**MySQL:**
```bash
docker-compose -f database/docker-compose.db.yml up -d mysql
```

**MongoDB:**
```bash
docker-compose -f database/docker-compose.db.yml up -d mongodb
```

### Full Database Stack
Deploy all databases for maximum flexibility:
```bash
cd database
docker-compose -f docker-compose.db.yml up -d
```

## Security Best Practices

- Use strong passwords (configured via environment variables)
- Enable SSL/TLS for production deployments
- Use dedicated database users with minimal privileges
- Regular backup and monitoring setup recommended

## Performance Tuning

- Connection pooling configured by default
- Indexes created for common query patterns
- Redis caching layer for high-frequency reads
- Configurable TTL and memory limits for cache

## Migration Support

- Automatic schema creation on first run
- Migration table tracking for future updates
- Backward compatible schema design