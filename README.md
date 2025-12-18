# Discord Crypto Degen Tool 🤖📈

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Discord bot that automatically detects cryptocurrency contract addresses in messages and responds with detailed token information from DexScreener API.

## 🌟 Features

- 🔍 Automatic token detection from contract addresses (e.g., 0x1234567890abcdef...)
- 📊 Rich embeds with market data, liquidity, volume, and price changes
- 📈 **NEW:** Automatic price charts integrated directly in embeds
- 📋 Copy contract address button
- 💹 Real-time data from DexScreener + GeckoTerminal
- 🌐 Multi-chain support

## 📋 Prerequisites

- Docker and Docker Compose
- Discord Bot Token

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone or download this repository**
2. **Update configuration**
   ```bash
   # Copy the example env file and edit with your Discord bot token
   cp .env.example .env
   nano .env  # Add TOKEN=your_discord_bot_token_here
   ```
3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```
4. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Option 2: Local Node.js Deployment

1. **Clone or download this repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Update .env with your Discord bot token**
4. **Run the bot**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## 📊 Usage

The bot will automatically respond to messages containing:
- Contract addresses (e.g., `0x1234567890abcdef...`)

It displays formatted embeds with:
- Token information from DexScreener
- **Automatic price charts** from GeckoTerminal (when available)
- A button to view the token on DexScreener

### 📈 Chart Feature

Price charts are **automatically generated and included** in the embed when a token is detected, showing:
- 24 hours of 1-hour candlestick data from GeckoTerminal
- Interactive price visualization integrated directly in the embed
- Real-time OHLC data from DEX pools

**Supported Networks:**
- Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche, Solana, and more

*Note: Charts are generated in the background and may take a few seconds to appear. If chart generation fails, the embed will still show all other token information.*

## 🐳 Docker Commands

- Start: `docker-compose up -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`
- Rebuild: `docker-compose up -d --build`

## 🐛 Troubleshooting

### Docker Build Issues

If you encounter Docker Hub authentication errors (500 Internal Server Error), try these solutions:

1. **Wait and retry**: Docker Hub issues are usually temporary
2. **Build with different options**:
   ```bash
   docker-compose build --no-cache --pull
   ```
3. **Use alternative networks**:
   ```bash
   docker build --network host .
   ```

### Alternative Base Images

If the Alpine image continues to fail, you can modify the Dockerfile to use:
- `node:18-slim` (Debian-based, larger but more compatible)
- `node:18-bullseye-slim` (Debian Bullseye)
- A specific image digest for stability

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) for Discord API integration
- [DexScreener](https://dexscreener.com/) for token data API
- [Node Fetch](https://github.com/node-fetch/node-fetch) for HTTP requests

## 📧 Contact

**Repository**: [https://github.com/imamfahrudin/discord-crypto-degen-tool](https://github.com/imamfahrudin/discord-crypto-degen-tool)

**Issues**: [Report a bug or request a feature](https://github.com/imamfahrudin/discord-crypto-degen-tool/issues)

---

Made with ❤️ for the crypto community