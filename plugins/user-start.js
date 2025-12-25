import { Markup } from "telegraf";
import config from "../config.js";

export default bot => {
  bot.start(ctx => {
    const id = ctx.from.id.toString();

    // Jika user belum ada di database
    if (!ctx.db.users[id]) {
      const isOwner = id === config.OWNER_ID.toString();

      ctx.db.users[id] = {
        telegram: {
          id,
          username: ctx.from.username || "-",
          role: isOwner ? "owner" : "user"
        },
        panel: {},
        servers: []
      };
    }

    ctx.reply(
`👋 Selamat Datang di Bot Pterodactyl

Bot ini menggunakan sistem *Pterodactyl Panel* untuk manajemen server otomatis melalui Telegram.

📦 Layanan:

💬 Jika ingin membeli server,
silakan hubungi *Owner* atau join *Channel* di bawah ini.`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url(
            "Owner",
            `https://t.me/${config.OWNER_USERNAME}`
          ),
          Markup.button.url("Channel", config.CHANNEL_URL)
        ])
      }
    );
  });
};