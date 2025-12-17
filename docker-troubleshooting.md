# Docker Troubleshooting Guide

## 🚨 Current Issue: Docker Hub 500 Internal Server Error

**Problem**: Docker Hub is returning 500 Internal Server Error for all Node.js images

**Status**: This is a Docker Hub infrastructure issue affecting all users worldwide.

## ✅ Docker-Only Solutions (Ubuntu Server)

### 1. Use Microsoft Container Registry (Current Setup)
The Dockerfile is already configured to use Microsoft's registry:

```bash
# On your Ubuntu server
cd ~/compose-vault/Bot/discord-crypto-degen-tool
git pull origin main
docker compose build --no-cache --pull
docker compose up -d
```

### 2. Configure Docker Registry Mirrors
Add alternative registries to bypass Docker Hub completely:

```bash
# Create or edit Docker daemon config
sudo nano /etc/docker/daemon.json

# Add these mirrors:
{
  "registry-mirrors": [
    "https://mirror.gcr.io",
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com"
  ]
}

# Restart Docker to apply changes
sudo systemctl daemon-reload
sudo systemctl restart docker

# Then rebuild
docker compose build --no-cache --pull
docker compose up -d
```

### 3. Use GitHub Container Registry Alternative
If Microsoft registry also has issues, try GitHub's registry:

```dockerfile
# Edit Dockerfile, change first line to:
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Or use a generic Ubuntu + Node setup:
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y nodejs npm
```

### 4. Force Clean Rebuild
```bash
# Stop all containers
docker compose down --volumes --remove-orphans

# Clean everything
docker system prune -a -f

# Remove all images
docker rmi $(docker images -q) 2>/dev/null || true

# Restart Docker service
sudo systemctl restart docker

# Rebuild completely with verbose output
docker compose build --no-cache --pull --progress=plain
docker compose up -d

# Check logs
docker compose logs -f bot
```

### 5. Try Building Without Pull Flag
Sometimes the `--pull` flag causes issues:

```bash
docker compose build --no-cache
docker compose up -d
```

### 6. Use Docker Build with Network Mode
```bash
# Build with host network mode
docker build --network host -t discord-crypto-degen-bot .
docker compose up -d
```

## 🔧 Alternative Dockerfile Options

### If Microsoft Registry Fails

**Option 1: Ubuntu Base + Manual Node.js Install**
```dockerfile
FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund
COPY . .
RUN groupadd -r botuser && useradd -r -g botuser botuser && chown -R botuser:botuser /app
USER botuser
CMD ["npm", "start"]
```

**Option 2: Alpine Linux (Smallest)**
```dockerfile
FROM alpine:3.19

RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund
COPY . .
RUN addgroup -S botuser && adduser -S botuser -G botuser && chown -R botuser:botuser /app
USER botuser
CMD ["npm", "start"]
```

**Option 3: Debian Slim**
```dockerfile
FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund
COPY . .
RUN groupadd -r botuser && useradd -r -g botuser botuser && chown -R botuser:botuser /app
USER botuser
CMD ["npm", "start"]
```

## 🔍 Diagnostic Commands

```bash
# Check Docker daemon status
sudo systemctl status docker

# Check Docker version
docker --version
docker compose version

# Test registry connectivity
curl -I https://mcr.microsoft.com
curl -I https://mirror.gcr.io

# Check DNS resolution
nslookup mcr.microsoft.com
nslookup registry-1.docker.io

# View Docker daemon logs
sudo journalctl -u docker -n 50

# Check Docker network
docker network ls
```

## 📊 Registry Status Monitoring

- **Microsoft Registry**: https://mcr.microsoft.com
- **Docker Hub Status**: https://status.docker.com/
- **Google Container Registry Mirror**: https://mirror.gcr.io

## 🆘 Emergency Docker-Only Solutions

### Multi-Stage Build Approach
Create a custom multi-stage Dockerfile that doesn't rely on external registries:

```dockerfile
FROM scratch AS base
# This won't work directly but shows the concept

# Better: Use a local registry or cache
# 1. Pull image on a working machine
docker pull mcr.microsoft.com/playwright/node:18-focal
docker save mcr.microsoft.com/playwright/node:18-focal > node-image.tar

# 2. Transfer to server and load
scp node-image.tar your-server:/tmp/
docker load < /tmp/node-image.tar

# 3. Build using the cached image
docker compose build --no-cache
```