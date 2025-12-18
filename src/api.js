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

module.exports = {
  fetchTokenData,
};