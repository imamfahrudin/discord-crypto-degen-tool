# Using Red Hat Universal Base Image (UBI) from Quay.io
FROM quay.io/redhat/ubi9/ubi-minimal:latest

# Install Node.js 18.x from NodeSource
RUN microdnf install -y curl ca-certificates && \
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && \
    microdnf install -y nodejs && \
    microdnf clean all

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with retry logic
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# Copy application code
COPY . .

# Start the application
CMD ["npm", "start"]