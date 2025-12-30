import permission from "../lib/permission.js";
import { escapeMarkdown } from "../lib/escape.js";

function formatRupiah(num = 0) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

export default bot => {
  bot.command(
    "saldo",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const id = ctx.from.id.toString();
      const user = ctx.db.users[id];

      if (!user) {
        return ctx.reply(
          "❌ Data user tidak ditemukan. Silakan /start terlebih dahulu."
        );
      }

      user.wallet ??= {
        balance: 0,
        history: []
      };

      user.wallet.balance = Number(user.wallet.balance || 0);

      const balance = user.wallet.balance;
      const totalHistory = user.wallet.history.length;

      const name = escapeMarkdown(ctx.from.first_name || "-");
      const username = escapeMarkdown(user.telegram.username || "-");
      const role = escapeMarkdown(user.telegram.role.toUpperCase());

      const msg =
`💰 *SALDO AKUN*

Nama     : ${name}
Username : @${username}
Role     : ${role}

Saldo Aktif : *${formatRupiah(balance)}*
Riwayat     : ${totalHistory} transaksi

Gunakan /pricelist untuk melihat paket
atau hubungi admin untuk deposit.`;

      return ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );
};