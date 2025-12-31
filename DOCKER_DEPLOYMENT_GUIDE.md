# 🐳 Docker Deployment Guide for Varsagel

## Quick Start

### Build Docker Image
```bash
docker build -t varsagel:latest .
```

### Run with Docker
```bash
# Create logs directory
mkdir -p logs

# Run with environment variables
docker run -d \
  --name varsagel \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-database-url" \
  -e AUTH_SECRET="your-auth-secret" \
  -v $(pwd)/logs:/app/logs \
  varsagel:latest
```

### Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  varsagel:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=https://www.varsagel.com
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with Docker Compose:
```bash
docker-compose up -d
```

## Production Deployment with Docker

### 1. Build for Production
```bash
# Build production image
docker build -t varsagel:production --target runner .

# Tag for registry
docker tag varsagel:production your-registry.com/varsagel:production

# Push to registry
docker push your-registry.com/varsagel:production
```

### 2. Deploy on Production Server
```bash
# Pull latest image
docker pull your-registry.com/varsagel:production

# Stop existing container
docker stop varsagel || true
docker rm varsagel || true

# Run new container
docker run -d \
  --name varsagel \
  --restart=unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  -v /var/log/varsagel:/app/logs \
  your-registry.com/varsagel:production
```

## PM2 Deployment

### Install PM2
```bash
npm install -g pm2
```

### Start with PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
pm2 save
```

### PM2 Management Commands
```bash
# List processes
pm2 list

# Monitor
pm2 monit

# View logs
pm2 logs varsagel

# Restart
pm2 restart varsagel

# Stop
pm2 stop varsagel

# Reload (zero-downtime)
pm2 reload varsagel
```

## Health Checks & Monitoring

### Application Health Check
```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check with timeout
timeout 10 curl -f http://localhost:3000/api/health || echo "Health check failed"
```

### Docker Health Monitoring
```bash
# Check container status
docker ps

# View container logs
docker logs varsagel

# Check resource usage
docker stats varsagel
```

## Security Considerations

### 1. Non-root User
The Dockerfile already creates and uses a non-root user for security.

### 2. Secret Management
Use Docker secrets or environment files:
```bash
# Create secrets file
echo "your-secret" | docker secret create auth_secret -

# Use in docker-compose
docker stack deploy -c docker-compose.yml varsagel
```

### 3. Network Security
```bash
# Create custom network
docker network create varsagel-network

# Run with network
docker run -d --network varsagel-network --name varsagel varsagel:latest
```

## Backup & Recovery

### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec varsagel-db pg_dump -U postgres varsagel | gzip > backup_${DATE}.sql.gz
EOF

chmod +x backup.sh
```

### Application Backup
```bash
# Backup logs
docker cp varsagel:/app/logs ./logs-backup-$(date +%Y%m%d)
```

## Troubleshooting

### Common Issues

1. **Build Fails**
```bash
# Clear build cache
docker build --no-cache -t varsagel:latest .
```

2. **Container Won't Start**
```bash
# Check logs
docker logs varsagel

# Interactive debugging
docker run -it --rm varsagel:latest sh
```

3. **Permission Issues**
```bash
# Fix log permissions
sudo chown -R 1001:1001 logs/
```

4. **Port Already in Use**
```bash
# Find process using port
sudo netstat -tulpn | grep :3000

# Use different port
docker run -p 3001:3000 varsagel:latest
```

## Performance Optimization

### 1. Multi-stage Build
The Dockerfile uses multi-stage builds to reduce final image size.

### 2. Resource Limits
```bash
docker run -d \
  --memory="1g" \
  --cpus="1.0" \
  --name varsagel \
  varsagel:latest
```

### 3. Volume Optimization
```bash
# Use named volumes for better performance
docker volume create varsagel-logs

docker run -d \
  -v varsagel-logs:/app/logs \
  --name varsagel \
  varsagel:latest
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker Image
        run: docker build -t varsagel:${{ github.sha }} .
      
      - name: Deploy to Server
        run: |
          docker stop varsagel || true
          docker rm varsagel || true
          docker run -d --name varsagel -p 3000:3000 --env-file .env.production varsagel:${{ github.sha }}
```

## Support

For issues and questions:
- Check application logs: `docker logs varsagel`
- Check PM2 logs: `pm2 logs varsagel`
- Monitor health: `curl http://localhost:3000/api/health`