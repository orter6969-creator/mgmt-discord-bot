const { Client, GatewayIntentBits } = require("discord.js");

// ===== SETTINGS (DON'T CHANGE UNLESS TOLD) =====
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // your private server ID
const PREFIX = "!"; // command prefix
// ==============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // Ignore bots & DMs
  if (message.author.bot) return;
  if (!message.guild) return;

  // Restrict bot to ONLY your MGMT server
  if (message.guild.id !== GUILD_ID) return;

  // Simple test command
  if (message.content === `${PREFIX}ping`) {
    message.reply("🏓 Pong! MGMT bot is working.");
  }
});

client.login(TOKEN);
