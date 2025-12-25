import permission from "../lib/permission.js";

/**
 * Format timestamp ke DD/MM/YYYY
 */
function formatDate(timestamp) {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Hitung sisa hari
 */
function remainingDays(expiredAt) {
  const now = Date.now();
  const diff = expiredAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default bot => {
  bot.command(
    "mysrv",
    permission(["customer", "admin", "owner"]),
    ctx => {
      const user = ctx.db.users[ctx.from.id];

      if (!user || !user.servers || user.servers.length === 0) {
        return ctx.reply("Kamu belum memiliki server.");
      }

      let msg = "🖥 *SERVER KAMU*\n\n";

      for (const srv of user.servers) {
        const expiredAt = srv.expired?.expired_at;
        const remain = expiredAt ? remainingDays(expiredAt) : null;

        let status = "❓ Tidak diketahui";
        if (remain !== null) {
          status = remain > 0
            ? `🟢 Aktif (${remain} hari lagi)`
            : "🔴 Expired";
        }

        msg +=
`━━━━━━━━━━━━━━━━━━
*${srv.name}*

*ID SERVER*
\`${srv.server_id}\`

*RESOURCE*
RAM  : ${srv.resource?.ram ?? "-"} MB
Disk : ${srv.resource?.disk ?? "-"} MB
CPU  : ${srv.resource?.cpu ?? "-"} %

*EXPIRED*
Durasi : ${srv.expired?.text ?? "-"}
Tanggal: ${expiredAt ? formatDate(expiredAt) : "-"}
Status : ${status}

`;
      }

      ctx.reply(msg, {
        parse_mode: "Markdown"
      });
    }
  );
};