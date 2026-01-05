const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// 🔄 Load Commands
client.commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log(`✅ MGMT Bot Online: ${client.user.tag}`);
});

// 🔐 Role Check
function hasPermission(member, allowedRoles) {
  return member.roles.cache.some(r => allowedRoles.includes(r.id));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== GUILD_ID) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  if (command.allowedRoles && !hasPermission(message.member, command.allowedRoles)) {
    return message.reply("❌ You do not have permission to use this command.");
  }

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("⚠️ Error executing command.");
  }
});

client.login(TOKEN);
