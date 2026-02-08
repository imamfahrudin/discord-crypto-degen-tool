# Using Debian slim (stable and reliable)
FROM debian:bookworm-slim

# Install Node.js 18.x, Python 3, and fonts for chart rendering
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg fonts-liberation fonts-dejavu python3 python3-pip python3-dev python3-venv lsb-release dnsutils && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg > /dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflare-client.list && \
    apt-get update && apt-get install -y cloudflare-warp && \
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

# Create startup script
RUN echo '#!/bin/bash\n\
if [ "$USE_WARP" = "true" ]; then\n\
    echo "Starting WARP daemon..."\n\
    warp-svc >/var/log/warp-svc.log 2>&1 &\n\
    echo "Waiting for WARP daemon to start..."\n\
    for i in {1..30}; do\n\
        if [ -S /run/cloudflare-warp/warp_service ]; then\n\
            echo "✅ Daemon ready after $i seconds"\n\
            break\n\
        fi\n\
        sleep 1\n\
    done\n\
    if [ ! -S /run/cloudflare-warp/warp_service ]; then\n\
        echo "❌ WARP daemon failed to start, proceeding without WARP"\n\
        echo "Daemon logs:"\n\
        cat /var/log/warp-svc.log\n\
    else\n\
        echo "Registering WARP..."\n\
        echo "y" | script -q -c "warp-cli registration new" /dev/null || echo "Registration may already exist"\n\
        sleep 2\n\
        echo "Setting WARP mode to warp+doh..."\n\
        warp-cli mode warp+doh\n\
        sleep 2\n\
        echo "Attempting to connect WARP..."\n\
        warp-cli connect\n\
        echo "Waiting for WARP connection..."\n\
        sleep 8\n\
        for i in {1..15}; do\n\
            echo "Connection attempt $i/15:"\n\
            STATUS=$(warp-cli status 2>&1)\n\
            echo "$STATUS"\n\
            if echo "$STATUS" | grep -q "Status update: Connected"; then\n\
                echo "✅ WARP Connected Successfully!"\n\
                break\n\
            elif echo "$STATUS" | grep -q "Connecting"; then\n\
                echo "WARP is connecting, waiting..."\n\
                sleep 5\n\
            else\n\
                echo "Attempt $i failed, retrying connection..."\n\
                warp-cli disconnect >/dev/null 2>&1\n\
                sleep 2\n\
                warp-cli connect >/dev/null 2>&1\n\
                sleep 5\n\
            fi\n\
        done\n\
        echo "Final WARP status:"\n\
        warp-cli status\n\
        echo "Testing connection to Bybit..."\n\
        if curl -I https://api.bybit.com --connect-timeout 10 >/dev/null 2>&1; then\n\
            echo "✅ Bybit is reachable!"\n\
        else\n\
            echo "⚠️  Warning: Could not reach Bybit - WARP may not be working"\n\
        fi\n\
    fi\n\
else\n\
    echo "WARP disabled, starting without VPN..."\n\
fi\n\
npm start' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]