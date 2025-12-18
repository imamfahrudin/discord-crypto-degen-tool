// Event handlers for Discord bot
const { createTokenEmbed, createDexScreenerButton } = require("./embed");
const { fetchTokenData } = require("./api");
const { fetchOHLCData, searchPoolsByToken } = require("./geckoterminal");
const { generatePriceChart } = require("./chart");

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
        const ohlcData = await fetchOHLCData(network, poolAddress, 'hour', 24); // 24 hours of 1h data

        if (ohlcData && ohlcData.length > 0) {
          const chartBuffer = await generatePriceChart(
            ohlcData,
            tokenData.baseToken.name,
            tokenData.baseToken.symbol,
            '1h'
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
    const actionRow = createDexScreenerButton(tokenData.url);

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

  // No interactive buttons currently - all are link buttons
}

module.exports = {
  handleTokenQuery,
  handleButtonInteraction,
};