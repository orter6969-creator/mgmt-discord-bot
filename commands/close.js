const { ROLES } = require("../config/roles");
const { CHANNELS } = require("../config/channels");

/* ===== HTML TRANSCRIPT CREATOR ===== */
async function createHTMLTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  let html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Ticket Transcript</title>
    <style>
      body { font-family: Arial; background:#0f172a; color:#e5e7eb; padding:20px; }
      .msg { margin-bottom:12px; }
      .user { font-weight:bold; color:#38bdf8; }
      .time { font-size:12px; color:#94a3b8; }
      .content { margin-left:10px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <h2>Ticket Transcript — #${channel.name}</h2>
    <hr>
  `;

  for (const msg of sorted.values()) {
    html += `
      <div class="msg">
        <div class="user">${msg.author.tag}</div>
        <div class="time">${new Date(msg.createdTimestamp).toLocaleString()}</div>
        <div class="content">${msg.content || "[No text]"}</div>
      </div>
    `;
  }

  html += `
  </body>
  </html>
  `;

  return Buffer.from(html);
}

module.exports = {
  name: "close",
  allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],

  async execute(message) {
    const channel = message.channel;

    if (!channel.name.startsWith("ticket-")) {
      return message.reply("❌ This is not a ticket channel.");
    }

    await message.reply("📄 Saving transcript & closing ticket...");

    const transcript = await createHTMLTranscript(channel);
    const logChannel = message.guild.channels.cache.get(CHANNELS.TICKET_LOGS);

    if (logChannel) {
      await logChannel.send({
        content: `📁 **Ticket Closed by ${message.author.tag}**\nChannel: ${channel.name}`,
        files: [
          {
            attachment: transcript,
            name: `${channel.name}.html`,
          },
        ],
      });
    }

    setTimeout(() => {
      channel.delete();
    }, 5000);
  },
};
