import permission from "../lib/permission.js";
import clientApi from "../lib/clientApi.js";

/**
 * Cari server & owner
 */
function findServerOwner(db, serverId) {
  for (const user of Object.values(db.users)) {
    const server = user.servers?.find(s => s.server_id === serverId);
    if (server) return { user, server };
  }
  return null;
}

export default bot => {
  bot.command(
    "startsrv",
    permission(["owner", "admin", "customer"]),
    async ctx => {
      try {
        const serverId = ctx.message.text.split(" ")[1];
        if (!serverId) {
          return ctx.reply("❌ Format:\n/startsrv idserver");
        }

        const result = findServerOwner(ctx.db, serverId);
        if (!result) {
          return ctx.reply("❌ Server tidak ditemukan.");
        }

        const { user, server } = result;

        // Customer hanya boleh server sendiri
        if (
          ctx.db.users[ctx.from.id].telegram.role === "customer" &&
          user.telegram.id !== ctx.from.id.toString()
        ) {
          return ctx.reply("❌ Kamu tidak punya akses ke server ini.");
        }

        // ===== POWER START =====
        await clientApi.post(
          `/servers/${server.server_id}/power`,
          { signal: "start" }
        );

        ctx.reply(
`▶️ Server *${server.name}* sedang dinyalakan
ID: ${server.server_id}`,
          { parse_mode: "Markdown" }
        );

      } catch (err) {
        console.error("STARTSRV ERROR:", err?.response?.data || err);
        ctx.reply("❌ Gagal menyalakan server.");
      }
    }
  );
};