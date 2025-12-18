// Event handlers for Discord bot
const { createTokenEmbed, createDexScreenerButton } = require("./embed");
const { fetchTokenData } = require("./api");

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

    const embed = createTokenEmbed(tokenData);
    const actionRow = createDexScreenerButton(tokenData.url);

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

  // No interactive buttons currently - all are link buttons
}

module.exports = {
  handleTokenQuery,
  handleButtonInteraction,
};