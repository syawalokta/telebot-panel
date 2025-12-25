import { Markup } from "telegraf";
import config from "../config.js";

export default bot => {
  bot.start(ctx => {
    const id = ctx.from.id.toString();
    const username = ctx.from.username || "-";
    const isOwner = id === config.OWNER_ID.toString();

    if (!ctx.db.users) ctx.db.users = {};

    // Create / patch user
    if (!ctx.db.users[id]) {
      ctx.db.users[id] = {
        telegram: {
          id,
          username,
          role: isOwner ? "owner" : "user"
        },
        panel: {},
        wallet: {
          balance: 0,
          history: []
        },
        servers: []
      };
    } else {
      ctx.db.users[id].telegram.username = username;
      if (isOwner) ctx.db.users[id].telegram.role = "owner";
      if (!ctx.db.users[id].wallet) {
        ctx.db.users[id].wallet = { balance: 0, history: [] };
      }
      if (!ctx.db.users[id].servers) {
        ctx.db.users[id].servers = [];
      }
    }

    ctx.reply(
`🚀 *Voltrapedia Pterodactyl Hosting*

Bot ini membantu kamu mengelola server *NodeJS*
langsung dari Telegram menggunakan *Pterodactyl Panel*.

✨ *Fitur Utama*
✔ Start / Stop / Restart Server
✔ Monitoring RAM, CPU, Disk
✔ Info Server & Masa Aktif
✔ Perpanjang Server (Extend)
✔ Sistem Saldo & Deposit

📌 *Perintah Utama*
• /pricelist — Melihat daftar harga
• /profile — Profil & statistik akun
• /mysrv — Daftar server kamu
• /saldo — Cek saldo

💬 Untuk pembelian server atau bantuan,
hubungi Owner atau join Channel.`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url(
            "👤 Owner",
            `https://t.me/${config.OWNER_USERNAME}`
          ),
          Markup.button.url(
            "📢 Channel",
            config.CHANNEL_URL
          )
        ])
      }
    );
  });
};