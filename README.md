# Discord Crypto Degen Tool

A Discord bot that automatically detects cryptocurrency contract addresses in messages and responds with detailed token information from DexScreener API.

## Features

- 🔍 Automatic token detection from contract addresses (e.g., 0x1234567890abcdef...)
- 📊 Rich embeds with market data, liquidity, volume, and price changes
- 📋 Copy contract address button
- 💹 Real-time data from DexScreener
- 🌐 Multi-chain support

## Setup

### Prerequisites

- Docker and Docker Compose
- Discord Bot Token

### Installation

1. Clone or download this repository
2. Copy `.env.example` to `.env` and add your Discord bot token:
   ```
   TOKEN=your_discord_bot_token_here
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your token
3. Run the bot:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Usage

The bot will automatically respond to messages containing:
- Contract addresses (e.g., `0x1234567890abcdef...`)

It displays formatted embeds with token information and a button to copy the contract address.

## Docker Commands

- Start: `docker-compose up -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`
- Rebuild: `docker-compose up -d --build`

## Troubleshooting

### Docker Build Issues

If you encounter Docker Hub authentication errors (500 Internal Server Error), try these solutions:

1. **Wait and retry**: Docker Hub issues are usually temporary
2. **Pull the base image first**:
   ```bash
   docker pull node:18.19-alpine3.19
   ```
3. **Build with different options**:
   ```bash
   docker-compose build --no-cache --pull
   ```
4. **Use alternative networks**:
   ```bash
   docker build --network host .
   ```

### Alternative Base Images

If the Alpine image continues to fail, you can modify the Dockerfile to use:
- `node:18-slim` (Debian-based, larger but more compatible)
- `node:18-bullseye-slim` (Debian Bullseye)
- A specific image digest for stability

## License

MIT