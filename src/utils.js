// Utility functions for formatting and calculations

/**
 * Formats large numbers into readable format (K, M, B)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  if (!num || isNaN(num)) return "N/A";

  const number = Number(num);

  if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
  if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
  if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";

  return number.toString();
}

/**
 * Determines market trend based on buy/sell transactions
 * @param {number} buys - Number of buy transactions
 * @param {number} sells - Number of sell transactions
 * @returns {string} Trend emoji and description
 */
function getMarketTrend(buys, sells) {
  if (buys > sells) return "🟢 Inflow";
  if (buys < sells) return "🔴 Outflow";
  return "⚪ Stable";
}

module.exports = {
  formatNumber,
  getMarketTrend,
};