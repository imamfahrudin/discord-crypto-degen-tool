// Event handlers for Discord bot
const { createTokenEmbed, createPriceComparisonEmbed, createDexScreenerButton, createTokenActionRow } = require("./embed");
const { fetchTokenData, fetchHistoricalPrice, fetchCurrentPriceFromCoinGecko } = require("./api");
const { fetchOHLCData, searchPoolsByToken } = require("./geckoterminal");
const { generateCandlestickChart } = require("./chart");

// Regex patterns
const PATTERNS = {
  CONTRACT_ADDRESS: /\b(0x[a-fA-F0-9]{40}|[A-Za-z0-9]{32,44})\b/,
};

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

    // Try to generate chart automatically
    let chartAttachment = null;
    try {
      // Map chainId to GeckoTerminal network name
      const networkMap = {
        'ethereum': 'eth',
        'bsc': 'bsc',
        'polygon': 'polygon_pos',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'avalanche': 'avax',
        'solana': 'solana'
      };

      const network = networkMap[tokenData.chainId] || tokenData.chainId;

      // Search for pools and get OHLC data
      const pools = await searchPoolsByToken(network, contractAddress);
      if (pools && pools.length > 0) {
        const poolAddress = pools[0].id.split('_')[1]; // Extract pool address
        const ohlcData = await fetchOHLCData(network, poolAddress, 'hour', parseInt(process.env.CHART_TIMEFRAME_HOURS) || 168); // Configurable hours of 1h data

        if (ohlcData && ohlcData.length > 0) {
          const chartBuffer = await generateCandlestickChart(
            ohlcData,
            tokenData.baseToken.name,
            tokenData.baseToken.symbol,
            '1h',
            contractAddress,
            network
          );

          chartAttachment = {
            attachment: chartBuffer,
            name: `${tokenData.baseToken.symbol}_chart.png`
          };
        }
      }
    } catch (chartError) {
      console.log("Chart generation failed, continuing without chart:", chartError.message);
    }

    const embed = createTokenEmbed(tokenData);
    const actionRow = createTokenActionRow(tokenData.url, tokenData.baseToken.address, tokenData.chainId, Math.floor(Date.now() / 1000));

    const replyOptions = { embeds: [embed], components: [actionRow] };

    // Add chart attachment if available
    if (chartAttachment) {
      replyOptions.files = [chartAttachment];
      // Set the chart as the embed image
      embed.setImage(`attachment://${chartAttachment.name}`);
    }

    await message.reply(replyOptions);

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

  const customId = interaction.customId;

  if (customId.startsWith('price_comparison_')) {
    await handlePriceComparison(interaction);
    return;
  }

  // No other interactive buttons currently
}

/**
 * Handles price comparison button interaction
 * @param {Interaction} interaction - Discord button interaction
 */
async function handlePriceComparison(interaction) {
  const parts = interaction.customId.split('_');
  const contractAddress = parts[2];
  const chainId = parts[3];
  const originalTimestamp = parseInt(parts[4]);

  await interaction.deferReply();

  try {
    // Get current data
    const currentData = await fetchTokenData(contractAddress);
    if (!currentData) {
      await interaction.editReply("🚫 Unable to fetch current token data.");
      return;
    }

    // Create original data object with timestamp
    const originalData = {
      ...currentData,
      timestamp: originalTimestamp
    };

    // Try to get historical data from CoinGecko for more accurate comparison
    let historicalData = null;
    try {
      historicalData = await fetchHistoricalPrice(contractAddress, chainId, originalTimestamp);
    } catch (error) {
      console.log("Historical data not available, using current data for comparison:", error.message);
    }

    // If we have historical data, use it for more accurate original prices
    if (historicalData && historicalData.price) {
      originalData.priceUsd = historicalData.price;
      originalData.marketCap = historicalData.marketCap;
    }

    // Create comparison embed
    const comparisonEmbed = createPriceComparisonEmbed(originalData, currentData, historicalData);

    // Create action row with DexScreener link
    const actionRow = createDexScreenerButton(currentData.url);

    await interaction.editReply({
      embeds: [comparisonEmbed],
      components: [actionRow]
    });

  } catch (error) {
    console.error("Error handling price comparison:", error);
    await interaction.editReply("❌ Failed to generate price comparison. Please try again later.");
  }
}

module.exports = {
  handleTokenQuery,
  handleButtonInteraction,
};