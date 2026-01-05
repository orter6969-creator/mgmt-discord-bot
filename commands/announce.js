const { ROLES } = require("../config/roles");

module.exports = {
  name: "announce",
  allowedRoles: [ROLES.ADMIN],

  execute(message, args) {
    const text = args.join(" ");
    if (!text) return message.reply("⚠️ Usage: `!announce <message>`");

    message.channel.send(`📢 **ANNOUNCEMENT**\n\n${text}`);
  }
};
