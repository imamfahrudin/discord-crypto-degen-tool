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

## License

MIT