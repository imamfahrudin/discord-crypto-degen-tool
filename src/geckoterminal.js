// GeckoTerminal API integration for OHLC data
const fetch = require("node-fetch");

/**
 * Fetches OHLC data from GeckoTerminal API
 * @param {string} network - Network name (e.g., 'eth', 'bsc', 'polygon')
 * @param {string} poolAddress - Pool contract address
 * @param {string} timeframe - Timeframe (e.g., 'minute', 'hour', 'day')
 * @param {number} limit - Number of data points (max 1000)
 * @returns {Promise<Array>} OHLC data array
 */
async function fetchOHLCData(network, poolAddress, timeframe = '1h', limit = 100) {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.attributes || !data.data.attributes.ohlcv_list) {
      return [];
    }

    // Transform GeckoTerminal OHLC format to standard OHLCV
    // Format: [timestamp, open, high, low, close, volume]
    return data.data.attributes.ohlcv_list.map(item => ({
      timestamp: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5] || 0)
    }));

  } catch (error) {
    console.error("Error fetching OHLC data:", error);
    throw error;
  }
}

/**
 * Fetches pool information from GeckoTerminal
 * @param {string} network - Network name
 * @param {string} poolAddress - Pool contract address
 * @returns {Promise<Object>} Pool information
 */
async function fetchPoolInfo(network, poolAddress) {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error("Error fetching pool info:", error);
    throw error;
  }
}

/**
 * Searches for pools by token address
 * @param {string} network - Network name
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<Array>} Array of pools
 */
async function searchPoolsByToken(network, tokenAddress) {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${tokenAddress}/pools`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];

  } catch (error) {
    console.error("Error searching pools:", error);
    throw error;
  }
}

module.exports = {
  fetchOHLCData,
  fetchPoolInfo,
  searchPoolsByToken,
};