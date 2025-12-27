import permission from "../lib/permission.js";
import clientApi from "../lib/clientApi.js";

function findServerOwner(db, serverId) {
  for (const user of Object.values(db.users)) {
    const server = user.servers?.find(s => s.server_id === serverId);
    if (server) return { user, server };
  }
  return null;
}

export default bot => {
  bot.command(
    "stopsrv",
    permission(["owner", "admin", "customer"]),
    async ctx => {
      try {
        const serverId = ctx.message.text.split(" ")[1];
        if (!serverId) {
          return ctx.reply("❌ Format:\n/stopsrv idserver");
        }

        const result = findServerOwner(ctx.db, serverId);
        if (!result) {
          return ctx.reply("❌ Server tidak ditemukan.");
        }

        const { user, server } = result;

        if (
          ctx.db.users[ctx.from.id].telegram.role === "customer" &&
          user.telegram.id !== ctx.from.id.toString()
        ) {
          return ctx.reply("❌ Kamu tidak punya akses ke server ini.");
        }

        // ===== POWER STOP =====
        await clientApi.post(
          `/servers/${server.server_id}/power`,
          { signal: "stop" }
        );

        ctx.reply(
`⏹ Server *${server.name}* sedang dimatikan
ID: ${server.server_id}`,
          { parse_mode: "Markdown" }
        );

      } catch (err) {
        console.error("STOPSRV ERROR:", err?.response?.data || err);
        ctx.reply("❌ Gagal mematikan server.");
      }
    }
  );
};