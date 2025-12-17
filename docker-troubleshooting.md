# Docker Troubleshooting Guide

## Common Issues and Solutions

### Docker Hub Authentication Errors (500 Internal Server Error)

If you encounter Docker Hub authentication errors, try these solutions:

#### 1. Wait and Retry
Docker Hub issues are usually temporary. Wait a few minutes and try again.

#### 2. Pull Base Image First
```bash
docker pull node:18.19-alpine3.19
docker-compose up -d --build
```

#### 3. Build with Different Options
```bash
# No cache, force pull
docker-compose build --no-cache --pull
docker-compose up -d

# Use host network
docker build --network host .
```

#### 4. Alternative Base Images
If Alpine continues to fail, modify the Dockerfile to use:
- `node:18-slim` (Debian-based, larger but more compatible)
- `node:18-bullseye-slim` (Debian Bullseye)
- `node:18-buster-slim` (Debian Buster)

#### 5. Use Specific Image Digest
For maximum stability, use a specific image digest:
```dockerfile
FROM node:18.19-alpine3.19@sha256:...
```

#### 6. Check Docker Configuration
- Ensure Docker Desktop is running
- Check internet connection
- Try logging out and back in to Docker Hub: `docker logout` then `docker login`

#### 7. Use Alternative Registries
```dockerfile
FROM registry.hub.docker.com/library/node:18.19-alpine3.19
# or
FROM docker.io/library/node:18.19-alpine3.19
```

### Other Common Issues

#### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :3000
# Kill the process or change the port in docker-compose.yml
```

#### Permission Issues
```bash
# On Linux/Mac
sudo chown -R $USER:$USER .
# On Windows, run Docker Desktop as administrator
```

#### Build Context Issues
```bash
# Build from correct directory
cd /path/to/discord-crypto-degen-tool
docker-compose up -d --build
```

### Debug Commands
```bash
# View build logs
docker-compose build --progress=plain

# Check container logs
docker-compose logs -f bot

# Enter running container
docker-compose exec bot sh

# Clean up
docker system prune -a
docker-compose down --volumes --remove-orphans
```