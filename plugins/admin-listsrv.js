import permission from "../lib/permission.js";

export default bot => {
  bot.command(
    "listsrv",
    permission(["owner", "admin"]),
    async ctx => {
      try {
        let text = "📋 LIST SEMUA SERVER PANEL\n\n";
        let total = 0;

        for (const user of Object.values(ctx.db.users)) {
          if (!user.servers || user.servers.length === 0) continue;

          for (const srv of user.servers) {
            total++;

            text +=
`Nama Server : ${srv.name}
Server ID   : ${srv.server_id}
Panel ID    : ${srv.panel_id}

Pemilik
- Telegram : @${user.telegram.username}
- Panel UID: ${user.panel?.user_id}

Resource
- RAM  : ${srv.resource?.ram ?? "-"} MB
- Disk : ${srv.resource?.disk ?? "-"} MB
- CPU  : ${srv.resource?.cpu ?? "-"} %

Expired : ${srv.expired?.text ?? "-"}

---------------------------
`;
          }
        }

        if (total === 0) {
          return ctx.reply("📭 Tidak ada server yang terdaftar.");
        }

        await ctx.reply(text);

      } catch (err) {
        console.error("LISTSRV ERROR:", err);
        ctx.reply("❌ Gagal menampilkan list server.");
      }
    }
  );
};