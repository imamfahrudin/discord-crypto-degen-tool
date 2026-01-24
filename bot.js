// Polyfills for Web APIs in Node.js environment
if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}
if (typeof TransformStream === 'undefined') {
  global.TransformStream = require('stream/web').TransformStream;
}

const { Client, GatewayIntentBits } = require("discord.js");
const { handleTokenQuery, handleButtonInteraction } = require("./src/handlers");
require("dotenv").config();

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

// Login and start the bot with retry logic for rate limiting
async function loginWithRetry(maxRetries = 5, initialDelay = 60000) {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      console.log(`🚀 Starting Discord bot... (attempt ${attempt + 1}/${maxRetries})`);
      await client.login(process.env.TOKEN);
      break; // Success, exit loop
    } catch (error) {
      if (error.httpStatus === 429) {
        console.log(`⚠️ Rate limited (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        attempt++;
      } else {
        console.error(`❌ HTTP Error: ${error}`);
        throw error;
      }
    }
  }

  if (attempt >= maxRetries) {
    console.error(`❌ Failed to start bot after ${maxRetries} attempts due to rate limiting.`);
    process.exit(1);
  }
}

loginWithRetry();