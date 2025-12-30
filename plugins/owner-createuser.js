import api from "../lib/api.js";
import permission from "../lib/permission.js";
import config from "../config.js";
import { Markup } from "telegraf";

function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sanitizeUsername(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 16);
}

export default bot => {
  bot.command(
    "createuser",
    permission(["owner"]),
    async ctx => {
      try {
        const input = ctx.message.text.replace("/createuser", "").trim();
        const [name, email, teleid] = input.split(",").map(v => v?.trim());

        if (!name || !email || !teleid) {
          return ctx.reply(
            "❌ Format salah\n\n/createuser nama,email,idtele"
          );
        }

        const tgUser = ctx.db.users[teleid];
        if (!tgUser) {
          return ctx.reply("❌ User Telegram belum menjalankan /start");
        }

        if (tgUser.panel?.user_id) {
          return ctx.reply("❌ User ini sudah memiliki akun panel.");
        }

        const password = generatePassword();
        const usernamePanel = sanitizeUsername(name);

        const res = await api.post("/users", {
          username: usernamePanel,
          email,
          first_name: name,
          last_name: "User",
          password
        });

        const panelUser = res.data.attributes;

        tgUser.panel = {
          user_id: panelUser.id,
          email: panelUser.email
        };
        tgUser.telegram.role = "customer";

        const ownerMsg =
`✅ Berhasil membuat user dan sukses dikirim

\`\`\`
Nama     : ${panelUser.username}
Username : @${tgUser.telegram.username}
User ID  : ${panelUser.id}
Email    : ${panelUser.email}
Password : ${password}
\`\`\``;

        await ctx.reply(ownerMsg, { parse_mode: "Markdown" });

        const userMsg =
`✅ Akun Panel Pterodactyl Berhasil Dibuat

*DETAIL USER*
\`\`\`
User ID  : ${tgUser.telegram.id}
Nama     : ${name}
Username : @${tgUser.telegram.username}
\`\`\`

*DETAIL ACCES*
\`\`\`
ID       : ${panelUser.id}
Username : ${panelUser.username}
Email    : ${panelUser.email}
Password : ${password}
\`\`\`

NOTE: Klik tombol dibawah atau tekan untuk menyalin domainnya`;

        await bot.telegram.sendMessage(
          teleid,
          userMsg,
          {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
              Markup.button.url(
                "🌐 DOMAIN PANEL",
                config.PANEL_URL
              )
            ])
          }
        );

      } catch (err) {
        console.error("CREATEUSER ERROR:", err?.response?.data || err);
        ctx.reply("❌ Gagal membuat user. Silakan cek log.");
      }
    }
  );
};