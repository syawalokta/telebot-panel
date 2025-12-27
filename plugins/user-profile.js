import permission from "../lib/permission.js";
import { escapeMarkdown } from "../lib/escape.js";

/**
 * Format angka ke Rupiah
 */
function formatRupiah(amount = 0) {
  return "Rp " + amount.toLocaleString("id-ID");
}

export default bot => {
  bot.command(
    "profile",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const user = ctx.db.users[ctx.from.id];

      if (!user) {
        return ctx.reply("❌ Data user tidak ditemukan.");
      }

      // 🔒 ESCAPE MARKDOWN (WAJIB)
      const name = escapeMarkdown(ctx.from.first_name || "-");
      const username = escapeMarkdown(user.telegram.username || "-");
      const role = (user.telegram.role || "user").toUpperCase();

      const servers = user.servers || [];
      const now = Date.now();

      let active = 0;
      let expired = 0;

      let totalRam = 0;
      let totalDisk = 0;
      let totalCpu = 0;

      for (const srv of servers) {
        if (srv.expired?.expired_at && srv.expired.expired_at > now) {
          active++;
        } else {
          expired++;
        }

        totalRam += Number(srv.resource?.ram || 0);
        totalDisk += Number(srv.resource?.disk || 0);
        totalCpu += Number(srv.resource?.cpu || 0);
      }

      // WALLET
      const balance = Number(user.wallet?.balance || 0);

      const msg =
`👤 *PROFIL AKUN*

*INFO USER*
Nama     : ${name}
Username : @${username}
Role     : ${role}

*PANEL*
User ID  : ${user.panel?.user_id ?? "-"}
Email    : ${user.panel?.email ?? "-"}

*SERVER*
Total Server : ${servers.length}
Aktif        : ${active}
Expired      : ${expired}

*RESOURCE (TOTAL)*
RAM  : ${totalRam} MB
Disk : ${totalDisk} MB
CPU  : ${totalCpu} %

*SALDO*
Saldo Aktif : ${formatRupiah(balance)}

ℹ️ Untuk melihat semua server gunakan /mysrv`;

      return ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );
};