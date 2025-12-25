import permission from "../lib/permission.js";
import api from "../lib/api.js";

/**
 * Cari server & pemiliknya
 */
function findServer(db, serverId) {
  for (const user of Object.values(db.users)) {
    const index = user.servers?.findIndex(
      s => s.server_id === serverId
    );
    if (index !== -1) {
      return { user, index };
    }
  }
  return null;
}

export default bot => {
  bot.command(
    "deletesrv",
    permission(["owner", "admin"]),
    async ctx => {
      try {
        const input = ctx.message.text.replace("/deletesrv", "").trim();
        const serverId = input;

        if (!serverId) {
          return ctx.reply(
            "❌ Format salah\n\n/deletesrv idserver"
          );
        }

        // ===== CARI SERVER =====
        const result = findServer(ctx.db, serverId);
        if (!result) {
          return ctx.reply("❌ Server ID tidak ditemukan di database.");
        }

        const { user, index } = result;
        const server = user.servers[index];

        // ===== DELETE DI PANEL =====
        await api.delete(`/servers/${server.panel_id}`);

        // ===== HAPUS DARI DATABASE =====
        user.servers.splice(index, 1);

        // ===== RESPONSE =====
        await ctx.reply(
`✅ Server berhasil dihapus

Pemilik   : @${user.telegram.username}
Nama      : ${server.name}
Server ID : ${server.server_id}`
        );

        // Notifikasi ke user
        try {
          await bot.telegram.sendMessage(
            user.telegram.id,
`❌ Server kamu telah dihapus oleh Admin

Nama      : ${server.name}
Server ID : ${server.server_id}`
          );
        } catch (_) {}

      } catch (err) {
        console.error("DELETESRV ERROR:", err.message);
        ctx.reply(`❌ Gagal menghapus server\n${err.message}`);
      }
    }
  );
};