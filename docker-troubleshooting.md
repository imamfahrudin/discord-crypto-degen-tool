# Docker Troubleshooting Guide

## 🚨 Current Issue: Docker Hub 500 Internal Server Error

**Problem**: Docker Hub is returning 500 Internal Server Error when pulling Node.js images

**Status**: This is a Docker Hub infrastructure issue, not your code.

## ✅ Immediate Solutions

### 1. Use Alternative Base Image (Recommended)
The Dockerfile has been updated to use `node:18-slim` instead of Alpine. Try building now:

```bash
docker-compose up -d --build
```

### 2. Use Microsoft Container Registry
If Debian-based images also fail, try Microsoft's registry:

```dockerfile
FROM mcr.microsoft.com/playwright/node:18-focal
```

### 3. Use Cached Images
If you have previously pulled Node.js images, Docker might use cached versions:

```bash
# List available Node images
docker images | grep node

# Try building without pulling
docker-compose build --no-cache
```

### 4. Use Docker Registry Mirrors
Configure Docker to use mirrors:

```bash
# Edit /etc/docker/daemon.json (Linux)
{
  "registry-mirrors": [
    "https://mirror.gcr.io",
    "https://dockerhub.timeweb.cloud",
    "https://hub-mirror.c.163.com"
  ]
}

# Then restart Docker
sudo systemctl restart docker
```

### 5. Use Alternative Docker Registries
```bash
# Use GitHub Container Registry (if available)
# FROM ghcr.io/nodejs/node:18-slim

# Use Quay.io
# FROM quay.io/nodejs/node:18-slim
```

## 🔄 Quick Fix Commands

```bash
# Try the updated Dockerfile (node:18-slim)
docker-compose up -d --build

# If that fails, try without cache
docker-compose build --no-cache
docker-compose up -d

# Check if Docker service is running
sudo systemctl status docker

# Restart Docker service
sudo systemctl restart docker
```

## 📊 Status Check

- **Docker Hub Status**: Check https://status.docker.com/
- **Your Internet**: Test `curl -I https://registry-1.docker.io`
- **DNS**: Test `nslookup registry-1.docker.io`

## 🆘 If All Else Fails

1. **Wait**: Docker Hub issues are usually resolved within hours
2. **Use Local Images**: If you have Node.js installed locally, consider running without Docker
3. **Alternative Deployment**: Use a different container registry or deployment method

### Run Locally (Without Docker)
```bash
# Install Node.js locally
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Copy .env file
cp .env.example .env
# Edit .env with your Discord token

# Run the bot
npm start
```

## 🔧 Alternative Dockerfile Options

### If node:18-slim also fails, try these:

```dockerfile
# Option 1: Ubuntu-based
FROM node:18-bullseye-slim

# Option 2: Microsoft Playwright image
FROM mcr.microsoft.com/playwright/node:18-focal

# Option 3: Use a different registry
FROM docker.io/library/node:18-slim

# Option 4: Use a specific digest (most stable)
FROM node:18-slim@sha256:1234567890abcdef...
```

### Build Commands to Try

```bash
# Basic build
docker-compose up -d --build

# No cache, force pull
docker-compose build --no-cache --pull
docker-compose up -d

# Use host network
docker build --network host .

# Verbose output
docker-compose build --progress=plain

# Build with specific platform
docker build --platform linux/amd64 .
```