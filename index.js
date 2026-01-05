const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const PREFIX = "!";

// ===== ROLE IDS (CHANGE THESE) =====
const ADMIN_ROLE_ID = "1457843496458125447";
const MANAGER_ROLE_ID = "1457843660124065944";
// ==================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`✅ MGMT Bot Online: ${client.user.tag}`);
});

// 🔐 ROLE CHECK FUNCTION
function hasPermission(member, allowedRoles) {
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== GUILD_ID) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ================= !PING =================
  if (command === "ping") {
    return message.reply("🏓 MGMT bot is alive.");
  }

  // ================= !PURGE =================
  if (command === "purge") {
    if (!hasPermission(message.member, [ADMIN_ROLE_ID, MANAGER_ROLE_ID])) {
      return message.reply("❌ You do not have permission to use this command.");
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply("⚠️ Usage: `!purge 1-100`");
    }

    await message.channel.bulkDelete(amount, true);
    message.channel.send(`🧹 Deleted ${amount} messages.`)
      .then(msg => setTimeout(() => msg.delete(), 3000));
  }

  // ================= !SAY =================
  if (command === "say") {
    if (!hasPermission(message.member, [ADMIN_ROLE_ID, MANAGER_ROLE_ID])) {
      return message.reply("❌ You do not have permission.");
    }

    const text = args.join(" ");
    if (!text) return message.reply("⚠️ Usage: `!say <message>`");

    message.delete();
    message.channel.send(text);
  }

  // ================= !ANNOUNCE =================
  if (command === "announce") {
    if (!hasPermission(message.member, [ADMIN_ROLE_ID])) {
      return message.reply("❌ Only Admin can use this.");
    }

    const announcement = args.join(" ");
    if (!announcement) {
      return message.reply("⚠️ Usage: `!announce <message>`");
    }

    message.channel.send(`📢 **ANNOUNCEMENT**\n\n${announcement}`);
  }
});

client.login(TOKEN);
