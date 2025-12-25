import permission from "../lib/permission.js";

/**
 * Format Rupiah
 */
function formatRupiah(num = 0) {
  return "Rp " + num.toLocaleString("id-ID");
}

export default bot => {
  bot.command(
    "saldo",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const id = ctx.from.id.toString();
      const user = ctx.db.users[id];

      if (!user) {
        return ctx.reply("❌ Data user tidak ditemukan. Silakan /start terlebih dahulu.");
      }

      // Pastikan wallet ada (hardening untuk user lama)
      if (!user.wallet) {
        user.wallet = {
          balance: 0,
          history: []
        };
      }

      const balance = user.wallet.balance || 0;
      const totalHistory = user.wallet.history.length;

      ctx.reply(
`💰 *SALDO AKUN*

Nama     : ${ctx.from.first_name || "-"}
Username : @${user.telegram.username}
Role     : ${user.telegram.role.toUpperCase()}

Saldo Aktif : *${formatRupiah(balance)}*
Riwayat     : ${totalHistory} transaksi

Gunakan /pricelist untuk melihat paket
atau hubungi admin untuk deposit.`,
        { parse_mode: "Markdown" }
      );
    }
  );
};