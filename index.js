const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
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

/* ================= LOAD COMMANDS ================= */
client.commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`✅ MGMT Bot Online: ${client.user.tag}`);
});

/* ================= ROLE CHECK ================= */
function hasPermission(member, allowedRoles) {
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

/* ================= COMMAND HANDLER ================= */
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

/* ================= INTERACTIONS (TICKETS) ================= */
client.on(Events.InteractionCreate, async (interaction) => {

  /* ===== BUTTON → OPEN MODAL ===== */
  if (interaction.isButton() && interaction.customId === "create_ticket") {

    const modal = new ModalBuilder()
      .setCustomId("ticket_modal")
      .setTitle("🎫 Create Ticket");

    const fullName = new TextInputBuilder()
      .setCustomId("full_name")
      .setLabel("Full Name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const idn = new TextInputBuilder()
      .setCustomId("idn")
      .setLabel("IDN")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const category = new TextInputBuilder()
      .setCustomId("category")
      .setLabel("Category")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reason = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Reason")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(fullName),
      new ActionRowBuilder().addComponents(idn),
      new ActionRowBuilder().addComponents(category),
      new ActionRowBuilder().addComponents(reason)
    );

    try {
  return await interaction.showModal(modal);
} catch (err) {
  console.log("Modal failed:", err.message);
    }
  }

  /* ===== MODAL SUBMIT → CREATE TICKET ===== */
  if (interaction.isModalSubmit() && interaction.customId === "ticket_modal") {

    const guild = interaction.guild;
    const member = interaction.member;

    const fullName = interaction.fields.getTextInputValue("full_name");
    const idn = interaction.fields.getTextInputValue("idn");
    const categoryValue = interaction.fields.getTextInputValue("category");
    const reason = interaction.fields.getTextInputValue("reason");

    const ticketCategory = guild.channels.cache.find(
      c => c.name === "🎫 TICKETS" && c.type === ChannelType.GuildCategory
    );

    if (!ticketCategory) {
      return interaction.reply({
        content: "❌ Ticket category not found.",
        ephemeral: true,
      });
    }

    const channel = await guild.channels.create({
      name: `ticket-${member.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: ticketCategory.id,
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

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Details")
      .setColor(0x5865F2)
      .addFields(
        { name: "👤 Full Name", value: fullName },
        { name: "🆔 IDN", value: idn },
        { name: "📂 Category", value: categoryValue },
        { name: "📝 Reason", value: reason }
      )
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    const msg = await channel.send({
      content: `<@${member.id}>`,
      embeds: [embed],
      components: [row],
    });

    await msg.pin();

    return interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true,
    });
  }

  /* ===== CLOSE TICKET BUTTON ===== */
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ This is not a ticket channel.",
        ephemeral: true,
      });
    }

    await interaction.reply("🔒 Closing ticket in 5 seconds...");
    setTimeout(() => {
      interaction.channel.delete();
    }, 5000);
  }
});
client.on("error", (err) => {
  console.error("Client error:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
/* ================= LOGIN ================= */
client.login(TOKEN);
