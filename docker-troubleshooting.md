# Docker Troubleshooting Guide

## 🚨 Current Issue: Docker Hub 500 Internal Server Error

**Problem**: Docker Hub is returning 500 Internal Server Error for all Node.js images

**Status**: This is a Docker Hub infrastructure issue affecting all users worldwide.

## ✅ Ubuntu Server Solutions

### 1. Use Microsoft Container Registry (Recommended)
The Dockerfile has been switched to use Microsoft's registry. Try building now:

```bash
# On your Ubuntu server
cd ~/compose-vault/Bot/discord-crypto-degen-tool
git pull origin main
docker compose build --no-cache --pull
docker compose up -d
```

### 2. Ubuntu-Specific Commands
```bash
# Update package lists
sudo apt update

# Install Docker Compose v2 (if not installed)
sudo apt install docker-compose-v2

# Or use Docker Compose plugin
sudo apt install docker-compose-plugin

# Check Docker versions
docker --version
docker compose version

# Restart Docker service
sudo systemctl restart docker
```

### 3. Force Clean Rebuild (Ubuntu)
```bash
# Stop all containers
docker compose down --volumes --remove-orphans

# Clean everything
docker system prune -a -f

# Remove all images (optional, if still failing)
docker rmi $(docker images -q) 2>/dev/null || true

# Rebuild completely
docker compose build --no-cache --pull --progress=plain
docker compose up -d

# Check logs
docker compose logs -f bot
```

### 4. Alternative: Local Node.js Installation
If Docker continues to fail, run directly on Ubuntu:

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Add your Discord token

# Run the bot
npm start
```

## 🔧 Microsoft Registry Dockerfile

The current Dockerfile uses:
```dockerfile
FROM mcr.microsoft.com/playwright/node:18-focal
```

This registry is more reliable than Docker Hub during outages.

## 📊 Status Monitoring

- **Docker Hub Status**: https://status.docker.com/
- **Microsoft Registry**: Usually more stable
- **Check your connection**: `curl -I https://mcr.microsoft.com`

## 🆘 Emergency Solutions

### If Microsoft Registry Also Fails

1. **Use Local Node.js** (recommended for production)
2. **Use a different VPS provider** with better Docker connectivity
3. **Wait for Docker Hub recovery** (usually 1-24 hours)
4. **Use alternative container registries** like GitHub Container Registry

### Quick Local Setup
```bash
# One-line setup
sudo apt update && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs && npm install && cp .env.example .env && echo "Edit .env with your Discord token, then run: npm start"
```