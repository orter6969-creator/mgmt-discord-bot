const { PermissionsBitField } = require("discord.js");
const { ROLES } = require("../config/roles");

module.exports = {
  name: "purge",
  allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],

  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply("⚠️ Usage: `!purge 1-100`");
    }

    await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(`🧹 Deleted ${amount} messages.`);
    setTimeout(() => msg.delete(), 3000);
  }
};
