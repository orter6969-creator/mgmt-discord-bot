const { ROLES } = require("../config/roles");

module.exports = {
  name: "close",
  allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],

  async execute(message) {
    if (!message.channel.name.startsWith("ticket-")) {
      return message.reply("❌ This is not a ticket channel.");
    }

    await message.channel.send("🔒 Closing ticket in 5 seconds...");
    setTimeout(() => {
      message.channel.delete();
    }, 5000);
  }
};
