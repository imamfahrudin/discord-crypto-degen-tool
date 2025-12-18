# Using Debian slim (stable and reliable)
FROM debian:bookworm-slim

# Install Node.js 18.x, Python 3, and fonts for chart rendering
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg fonts-liberation fonts-dejavu python3 python3-pip python3-dev && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json requirements.txt ./

# Install Python dependencies in virtual environment
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Make sure virtual environment Python is used
ENV PATH="/opt/venv/bin:$PATH"

# Install Node.js dependencies with retry logic
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# Copy application code
COPY . .

# Start the application
CMD ["npm", "start"]