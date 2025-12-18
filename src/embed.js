// Embed creation utilities
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { formatNumber, getMarketTrend } = require("./utils");

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

module.exports = {
  createTokenEmbed,
  createDexScreenerButton,
};