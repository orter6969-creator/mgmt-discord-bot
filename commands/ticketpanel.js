const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ROLES } = require("../config/roles");

module.exports = {
  name: "ticketpanel",
  allowedRoles: [ROLES.ADMIN],

  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Support / Management Tickets")
      .setDescription(
        "**Read before creating a ticket:**\n\n" +
        "• Tickets are for **official MGMT matters only**\n" +
        "• Do NOT spam tickets\n" +
        "• Be clear and professional\n\n" +
        "Click the button below to create a private ticket."
      )
      .setColor(0x5865F2)
      .setFooter({ text: "MGMT Ticket System" });

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("🎫 Create Ticket")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete();
  }
};
