import api from "../lib/api.js";
import permission from "../lib/permission.js";
import config from "../config.js";

export default bot => {
  bot.command(
    "deleteuser",
    permission(["owner"]),
    async ctx => {
      try {
        const input = ctx.message.text.replace("/deleteuser", "").trim();
        const teleid = input;

        if (!teleid) {
          return ctx.reply("❌ Format salah\n\nGunakan:\n/deleteuser idtele");
        }

        if (!/^\d+$/.test(teleid)) {
          return ctx.reply("❌ Telegram ID harus berupa angka.");
        }

        const user = ctx.db.users[teleid];

        if (!user) {
          return ctx.reply("❌ User tidak ditemukan di database.");
        }

        if (!user.panel?.user_id) {
          return ctx.reply("❌ User ini tidak memiliki akun panel.");
        }

        const panelUserId = user.panel.user_id;
        const isOwner = teleid === config.OWNER_ID.toString();

        await api.delete(`/users/${panelUserId}`);

        user.panel = {};
        user.servers = [];

        if (!isOwner) {
          user.telegram.role = "user";
        }

        const ownerMsg =
`✅ User panel berhasil dihapus

Telegram ID : ${teleid}
Username    : @${user.telegram.username}
Panel ID    : ${panelUserId}
Role        : ${user.telegram.role}`;

        await ctx.reply(ownerMsg);

        try {
          await bot.telegram.sendMessage(
            teleid,
            "❌ Akun panel kamu telah dihapus oleh Owner."
          );
        } catch (_) {}

      } catch (err) {
        console.error("DELETEUSER ERROR:", err?.response?.data || err);
        ctx.reply("❌ Gagal menghapus user. Silakan cek log.");
      }
    }
  );
};