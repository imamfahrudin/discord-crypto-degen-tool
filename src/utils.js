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
 * Formats numbers with commas and proper decimal places (raw format)
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: auto)
 * @returns {string} Formatted number string with commas
 */
function formatRawNumber(num, decimals = null) {
  if (!num || isNaN(num)) return "N/A";

  const number = Number(num);

  // Auto-determine decimal places if not specified
  if (decimals === null) {
    if (number < 0.000001) {
      decimals = 10;
    } else if (number < 0.001) {
      decimals = 8;
    } else if (number < 1) {
      decimals = 6;
    } else if (number < 100) {
      decimals = 4;
    } else {
      decimals = 2;
    }
  }

  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
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

/**
 * Calculates price difference and multiplier between two values
 * @param {number} oldPrice - The original price
 * @param {number} newPrice - The current price
 * @returns {Object} Object containing difference, percentage, and multiplier
 */
function calculatePriceDifference(oldPrice, newPrice) {
  if (!oldPrice || !newPrice || oldPrice <= 0 || newPrice <= 0) {
    return {
      difference: 0,
      percentage: 0,
      multiplier: 1,
      direction: "stable"
    };
  }

  const difference = newPrice - oldPrice;
  const percentage = ((difference / oldPrice) * 100);
  const multiplier = newPrice / oldPrice;

  let direction = "stable";
  if (difference > 0) direction = "up";
  if (difference < 0) direction = "down";

  return {
    difference,
    percentage,
    multiplier,
    direction
  };
}

/**
 * Formats price difference for display
 * @param {Object} diff - Result from calculatePriceDifference
 * @returns {string} Formatted difference string
 */
function formatPriceDifference(diff) {
  const { difference, percentage, multiplier, direction } = diff;

  const sign = direction === "up" ? "+" : direction === "down" ? "-" : "";
  const emoji = direction === "up" ? "📈" : direction === "down" ? "📉" : "➡️";

  return `${emoji} ${sign}$${formatNumber(Math.abs(difference))} (${sign}${percentage.toFixed(2)}%)`;
}

/**
 * Formats multiplier for display
 * @param {number} multiplier - The multiplier value
 * @returns {string} Formatted multiplier string
 */
function formatMultiplier(multiplier) {
  if (multiplier >= 1) {
    return `🚀 ${multiplier.toFixed(2)}x`;
  } else {
    return `📉 ${(1/multiplier).toFixed(2)}x down`;
  }
}

/**
 * Parses formatted numbers with K, M, B suffixes back to regular numbers
 * @param {string} formattedNum - Formatted number string (e.g., "1.5M", "250K", "2B")
 * @returns {number} Parsed number
 */
function parseFormattedNumber(formattedNum) {
  if (!formattedNum || typeof formattedNum !== 'string') return 0;

  const numStr = formattedNum.replace(/[$,]/g, '');
  const lastChar = numStr.slice(-1).toUpperCase();
  const num = parseFloat(numStr.slice(0, -1));

  if (isNaN(num)) return 0;

  switch (lastChar) {
    case 'K':
      return num * 1000;
    case 'M':
      return num * 1000000;
    case 'B':
      return num * 1000000000;
    default:
      // If no suffix, parse the whole string as a number
      return parseFloat(numStr) || 0;
  }
}

module.exports = {
  formatNumber,
  formatRawNumber,
  getMarketTrend,
  calculatePriceDifference,
  formatPriceDifference,
  formatMultiplier,
  parseFormattedNumber,
};