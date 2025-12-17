# Use a more reliable Node.js image from a different source
# If Docker Hub is having issues, try one of these alternatives:
# FROM node:18-slim
# FROM node:18-bullseye-slim
# FROM mcr.microsoft.com/playwright/node:18-focal
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with retry logic
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN groupadd -r botuser && useradd -r -g botuser botuser && \
    chown -R botuser:botuser /app

# Switch to non-root user
USER botuser

# Expose port (optional, for health checks)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]