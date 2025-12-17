# Using Fedora from Quay.io (Red Hat's registry - more reliable)
FROM quay.io/fedora/fedora:39-x86_64

# Install Node.js 18.x
RUN dnf install -y nodejs npm && \
    dnf clean all

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

# Start the application
CMD ["npm", "start"]