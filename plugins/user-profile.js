import permission from "../lib/permission.js";

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

      const servers = user.servers || [];

      // Hitung server aktif & expired
      let active = 0;
      let expired = 0;

      const now = Date.now();

      // Total resource
      let totalRam = 0;
      let totalDisk = 0;
      let totalCpu = 0;

      for (const srv of servers) {
        if (srv.expired?.expired_at && srv.expired.expired_at > now) {
          active++;
        } else {
          expired++;
        }

        totalRam += srv.resource?.ram || 0;
        totalDisk += srv.resource?.disk || 0;
        totalCpu += srv.resource?.cpu || 0;
      }

      const balance = user.wallet?.balance ?? 0;

      const msg =
`👤 *PROFIL AKUN*

*INFO USER*
Nama     : ${ctx.from.first_name ?? "-"}
Username : @${user.telegram.username}
Role     : ${user.telegram.role.toUpperCase()}

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
Saldo Aktif : ${formatRupiah(balance)}`;

      ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );
};