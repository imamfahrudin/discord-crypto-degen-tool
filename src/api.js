// API interaction utilities
const fetch = require("node-fetch");

/**
 * Fetches token data from DexScreener API
 * @param {string} query - Contract address or token identifier
 * @returns {Promise<Object|null>} Token data or null if not found
 */
async function fetchTokenData(query) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    return data.pairs[0];
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
}

/**
 * Fetches historical price data from CoinGecko API
 * @param {string} contractAddress - Token contract address
 * @param {string} chainId - Blockchain network (ethereum, bsc, etc.)
 * @param {number} timestamp - Unix timestamp for historical data
 * @returns {Promise<Object|null>} Historical price data or null if not found
 */
async function fetchHistoricalPrice(contractAddress, chainId, timestamp) {
  try {
    // Map chainId to CoinGecko platform ID
    const platformMap = {
      'ethereum': 'ethereum',
      'bsc': 'binance-smart-chain',
      'polygon': 'polygon-pos',
      'arbitrum': 'arbitrum-one',
      'optimism': 'optimistic-ethereum',
      'base': 'base',
      'avalanche': 'avalanche',
      'solana': 'solana'
    };

    const platform = platformMap[chainId.toLowerCase()];
    if (!platform) {
      console.log(`Unsupported chain: ${chainId}`);
      return null;
    }

    // Convert timestamp to date string for CoinGecko API
    const date = new Date(timestamp * 1000);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contractAddress}/history?date=${dateString}&localization=false`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Token not found on CoinGecko for ${contractAddress} on ${platform}`);
        return null;
      }
      throw new Error(`CoinGecko API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.market_data) {
      console.log(`No market data available for ${contractAddress} on ${dateString}`);
      return null;
    }

    return {
      price: data.market_data.current_price?.usd,
      marketCap: data.market_data.market_cap?.usd,
      volume24h: data.market_data.total_volume?.usd,
      timestamp: timestamp
    };

  } catch (error) {
    console.error("Error fetching historical price:", error);
    return null;
  }
}

/**
 * Fetches current price data from CoinGecko API
 * @param {string} contractAddress - Token contract address
 * @param {string} chainId - Blockchain network
 * @returns {Promise<Object|null>} Current price data or null if not found
 */
async function fetchCurrentPriceFromCoinGecko(contractAddress, chainId) {
  try {
    // Map chainId to CoinGecko platform ID
    const platformMap = {
      'ethereum': 'ethereum',
      'bsc': 'binance-smart-chain',
      'polygon': 'polygon-pos',
      'arbitrum': 'arbitrum-one',
      'optimism': 'optimistic-ethereum',
      'base': 'base',
      'avalanche': 'avalanche',
      'solana': 'solana'
    };

    const platform = platformMap[chainId.toLowerCase()];
    if (!platform) {
      console.log(`Unsupported chain: ${chainId}`);
      return null;
    }

    const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data[contractAddress.toLowerCase()]) {
      console.log(`Token not found on CoinGecko: ${contractAddress}`);
      return null;
    }

    const tokenData = data[contractAddress.toLowerCase()];

    return {
      price: tokenData.usd,
      marketCap: tokenData.usd_market_cap,
      volume24h: tokenData.usd_24h_vol,
      priceChange24h: tokenData.usd_24h_change,
      timestamp: Math.floor(Date.now() / 1000)
    };

  } catch (error) {
    console.error("Error fetching current price from CoinGecko:", error);
    return null;
  }
}

module.exports = {
  fetchTokenData,
  fetchHistoricalPrice,
  fetchCurrentPriceFromCoinGecko,
};