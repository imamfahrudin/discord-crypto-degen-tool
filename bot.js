// Polyfills for Web APIs in Node.js environment
if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}
if (typeof TransformStream === 'undefined') {
  global.TransformStream = require('stream/web').TransformStream;
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = require("node-fetch");
require("dotenv").config();

// Regex patterns
const PATTERNS = {
  CONTRACT_ADDRESS: /\b(0x[a-fA-F0-9]{40}|[A-Za-z0-9]{32,44})\b/,
};

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
    .setURL(url)
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
    .setFooter({ text: process.env.FOOTER_TEXT || "DO YOUR OWN RESEARCH-ALWAYS!" });
}

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
 * Handles contract address detection and token information response
 * @param {Message} message - Discord message object
 */
async function handleTokenQuery(message) {
  const addressMatch = message.content.match(PATTERNS.CONTRACT_ADDRESS);

  if (!addressMatch) {
    return; // No contract address found
  }

  const contractAddress = addressMatch[0];

  try {
    const tokenData = await fetchTokenData(contractAddress);

    if (!tokenData) {
      await message.reply("🚫 Token not found.");
      return;
    }

    const embed = createTokenEmbed(tokenData);

    // Create DexScreener button
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("dexscreener_link")
        .setLabel("� View on DexScreener")
        .setStyle(ButtonStyle.Primary)
    );

    await message.reply({ embeds: [embed], components: [actionRow] });

  } catch (error) {
    console.error("Error processing token query:", error);
    await message.reply("❌ Failed to fetch token data. Please try again later.");
  }
}

/**
 * Handles button interactions
 * @param {Interaction} interaction - Discord interaction object
 */
async function handleButtonInteraction(interaction) {
  if (!interaction.isButton()) return;

  if (interaction.customId === "dexscreener_link") {
    // Get the DexScreener URL from the embed
    const embedUrl = interaction.message.embeds[0]?.url;
    if (embedUrl) {
      await interaction.reply({
        content: `🔍 View on DexScreener: ${embedUrl}`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Unable to find DexScreener link.",
        ephemeral: true
      });
    }
  }
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Event handlers
client.once("clientReady", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  await handleTokenQuery(message);
});

client.on("interactionCreate", async (interaction) => {
  await handleButtonInteraction(interaction);
});

// Login and start the bot
client.login(process.env.TOKEN);