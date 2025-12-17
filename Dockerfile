# Using CentOS Stream from Quay.io (Red Hat's lightweight base)
FROM quay.io/centos/centos:stream9-minimal

# Install Node.js 18.x from NodeSource (guaranteed newer version)
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

# Add Web API polyfills for undici compatibility
RUN node -e "global.ReadableStream = require('stream/web').ReadableStream; global.TransformStream = require('stream/web').TransformStream;"

# Copy application code
COPY . .

# Start the application
CMD ["npm", "start"]