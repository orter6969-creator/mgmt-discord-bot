const { ROLES } = require("../config/roles");

module.exports = {
  name: "say",
  allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],

  execute(message, args) {
    const text = args.join(" ");
    if (!text) return message.reply("⚠️ Usage: `!say <message>`");

    message.delete();
    message.channel.send(text);
  }
};
