// Embed creation utilities
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { formatNumber, getMarketTrend, calculatePriceDifference, formatPriceDifference, formatMultiplier } = require("./utils");

/**
 * Creates a formatted Discord embed for token information
 * @param {Object} token - Token data from DexScreener API
 * @returns {EmbedBuilder} Formatted Discord embed
 */
function createTokenEmbed(token) {
  const {
    baseToken: { name, symbol, address },
    chainId,
    priceUsd,
    marketCap,
    volume,
    liquidity,
    fdv,
    url,
    priceChange,
    txns,
  } = token;

  // Format price changes
  const change1h = priceChange?.h1 ? `${Number(priceChange.h1).toFixed(2)}%` : "N/A";
  const change24h = priceChange?.h24 ? `${Number(priceChange.h24).toFixed(2)}%` : "N/A";

  // Transaction data
  const buys = txns?.h24?.buys ?? "N/A";
  const sells = txns?.h1?.sells ?? "N/A";
  const trend = getMarketTrend(buys, sells);

  const chainName = chainId.toUpperCase();

  return new EmbedBuilder()
    .setColor(parseInt(process.env.PRIMARY_COLOR) || 0x00b0f4)
    .setTitle(`${name} (${symbol}) - ${chainName}`)
    .addFields(
      // Market metrics
      { name: "🐋 Market Cap", value: `\`\`\`   $${formatNumber(marketCap)}   \`\`\``, inline: true },
      { name: "🔐 Liquidity", value: `\`\`\`   $${formatNumber(liquidity?.usd)}   \`\`\``, inline: true },
      { name: "⚖️ FDV", value: `\`\`\`   $${formatNumber(fdv)}   \`\`\``, inline: true },

      // Price changes
      { name: "📈 1h Change", value: `\`\`\`   ${change1h}   \`\`\``, inline: true },
      { name: "💹 24h Change", value: `\`\`\`   ${change24h}   \`\`\``, inline: true },
      { name: "🕒 Volume 24h", value: `\`\`\`   $${formatNumber(volume?.h24)}   \`\`\``, inline: true },

      // Transaction data
      { name: "📊 Price", value: `\`\`\`   $${formatNumber(priceUsd)}   \`\`\``, inline: true },
      { name: "🧾 Buys / Sells", value: `\`\`\`   ${buys} / ${sells}   \`\`\``, inline: true },
      { name: "💸 Flow Trend", value: `\`\`\`   ${trend}   \`\`\``, inline: true },

      // Contract address
      { name: "🏷️ Contract Address", value: `\`\`\`${address}\`\`\`` }
    )
    .setFooter({ text: process.env.FOOTER_TEXT || "DO YOUR OWN RESEARCH-ALWAYS!" })
    .setTimestamp();
}

/**
 * Creates a price comparison embed showing differences since original timestamp
 * @param {Object} originalData - Original token data with timestamp
 * @param {Object} currentData - Current token data
 * @param {Object} historicalData - Historical data from CoinGecko (optional)
 * @returns {EmbedBuilder} Price comparison embed
 */
function createPriceComparisonEmbed(originalData, currentData, historicalData = null) {
  const {
    baseToken: { name, symbol, address },
    chainId,
    priceUsd: originalPrice,
    marketCap: originalMarketCap,
    volume,
    timestamp: originalTimestamp
  } = originalData;

  const {
    priceUsd: currentPrice,
    marketCap: currentMarketCap,
    volume: currentVolume
  } = currentData;

  const chainName = chainId.toUpperCase();

  // Calculate price differences
  const priceDiff = calculatePriceDifference(originalPrice, currentPrice);
  const marketCapDiff = calculatePriceDifference(originalMarketCap, currentMarketCap);

  // Format timestamps
  const originalTime = new Date(originalTimestamp * 1000).toLocaleString();
  const currentTime = new Date().toLocaleString();

  const embed = new EmbedBuilder()
    .setColor(priceDiff.direction === "up" ? 0x00ff00 : priceDiff.direction === "down" ? 0xff0000 : 0x808080)
    .setTitle(`📊 ${name} (${symbol}) - Price Comparison`)
    .setDescription(`Comparing prices from **${originalTime}** to **${currentTime}** (${chainName})`)
    .addFields(
      // Price comparison
      { name: "💰 Original Price", value: `\`\`\`   $${formatNumber(originalPrice)}   \`\`\``, inline: true },
      { name: "💰 Current Price", value: `\`\`\`   $${formatNumber(currentPrice)}   \`\`\``, inline: true },
      { name: "📈 Price Change", value: `\`\`\`   ${formatPriceDifference(priceDiff)}   \`\`\``, inline: true },

      // Market cap comparison
      { name: "🐋 Original Market Cap", value: `\`\`\`   $${formatNumber(originalMarketCap)}   \`\`\``, inline: true },
      { name: "🐋 Current Market Cap", value: `\`\`\`   $${formatNumber(currentMarketCap)}   \`\`\``, inline: true },
      { name: "📊 MC Change", value: `\`\`\`   ${formatPriceDifference(marketCapDiff)}   \`\`\``, inline: true },

      // Multipliers and volume
      { name: "🚀 Price Multiplier", value: `\`\`\`   ${formatMultiplier(priceDiff.multiplier)}   \`\`\``, inline: true },
      { name: "📊 MC Multiplier", value: `\`\`\`   ${formatMultiplier(marketCapDiff.multiplier)}   \`\`\``, inline: true },
      { name: "🕒 Current Volume", value: `\`\`\`   $${formatNumber(currentVolume?.h24)}   \`\`\``, inline: true },

      // Contract address
      { name: "🏷️ Contract Address", value: `\`\`\`${address}\`\`\`` }
    )
    .setFooter({ text: "Price comparison data from DexScreener | DO YOUR OWN RESEARCH!" })
    .setTimestamp();

  // Add historical data note if available
  if (historicalData) {
    embed.addFields({
      name: "📅 Historical Data",
      value: `*Data includes historical price information from CoinGecko*`,
      inline: false
    });
  }

  return embed;
}

/**
 * Creates action row with DexScreener link button
 * @param {string} url - DexScreener URL
 * @returns {ActionRowBuilder} Action row with button
 */
function createDexScreenerButton(url) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🔍 View on DexScreener")
      .setStyle(ButtonStyle.Link)
      .setURL(url)
  );
}

/**
 * Creates action row with both DexScreener and Price Comparison buttons
 * @param {string} url - DexScreener URL
 * @param {string} contractAddress - Token contract address
 * @param {string} chainId - Blockchain network
 * @param {number} timestamp - Original timestamp
 * @returns {ActionRowBuilder} Action row with both buttons
 */
function createTokenActionRow(url, contractAddress, chainId, timestamp) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🔍 View on DexScreener")
      .setStyle(ButtonStyle.Link)
      .setURL(url),
    new ButtonBuilder()
      .setLabel("💰 Check Current Price")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId(`price_comparison_${contractAddress}_${chainId}_${timestamp}`)
  );
}

/**
 * Creates action row for price comparison embed with Refresh and Delete buttons
 * @param {string} contractAddress - Token contract address
 * @param {string} chainId - Blockchain network
 * @param {number} originalTimestamp - Original timestamp from the first embed
 * @param {string} url - DexScreener URL
 * @returns {ActionRowBuilder} Action row with refresh and delete buttons
 */
function createPriceComparisonActionRow(contractAddress, chainId, originalTimestamp, url) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🔄 Refresh Price")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`price_refresh_${contractAddress}_${chainId}_${originalTimestamp}`),
    new ButtonBuilder()
      .setLabel("🗑️ Delete")
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`price_delete`),
    new ButtonBuilder()
      .setLabel("🔍 View on DexScreener")
      .setStyle(ButtonStyle.Link)
      .setURL(url)
  );
}

module.exports = {
  createTokenEmbed,
  createPriceComparisonEmbed,
  createDexScreenerButton,
  createTokenActionRow,
  createPriceComparisonActionRow,
};