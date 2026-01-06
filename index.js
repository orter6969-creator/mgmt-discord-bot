const { 
  Client, 
  GatewayIntentBits, 
  ChannelType, 
  PermissionsBitField, 
  Events 
} = require("discord.js");
const fs = require("fs");
const { ROLES } = require("./config/roles");

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

// ================= LOAD COMMANDS =================
client.commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ MGMT Bot Online: ${client.user.tag}`);
});

// ================= ROLE CHECK =================
function hasPermission(member, allowedRoles) {
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

// ================= COMMAND HANDLER =================
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

// ================= BUTTON INTERACTION (TICKETS) =================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "create_ticket") return;

  const guild = interaction.guild;
  const member = interaction.member;

  if (guild.id !== GUILD_ID) {
    return interaction.reply({ content: "❌ Invalid server.", ephemeral: true });
  }

  const category = guild.channels.cache.find(
    c => c.name === "🎫 TICKETS" && c.type === ChannelType.GuildCategory
  );

  if (!category) {
    return interaction.reply({
      content: "❌ Ticket category not found.",
      ephemeral: true,
    });
  }

  const channelName = `ticket-${member.user.username}`.toLowerCase();

  const existing = guild.channels.cache.find(c => c.name === channelName);
  if (existing) {
    return interaction.reply({
      content: "⚠️ You already have an open ticket.",
      ephemeral: true,
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: ROLES.ADMIN,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: ROLES.MANAGER,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });

  await channel.send(
    `🎫 **Ticket Created**\n\n` +
    `User: <@${member.id}>\n` +
    `Please explain your issue clearly.\n\n` +
    `🔒 Only MGMT can view this.\n` +
    `Use \`!close\` to close this ticket.`
  );

  await interaction.reply({
    content: `✅ Ticket created: ${channel}`,
    ephemeral: true,
  });
});

// ================= LOGIN =================
client.login(TOKEN);
