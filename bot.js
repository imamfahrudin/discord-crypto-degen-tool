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

// Login and start the bot
client.login(process.env.TOKEN);