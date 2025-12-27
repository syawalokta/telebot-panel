import permission from "../lib/permission.js";
import { clearDepositState } from "../lib/deposit.js";

export default bot => {
  bot.command(
    "canceldeposit",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const userId = ctx.from.id.toString();
      const deposits = ctx.db.deposits || {};

      // Cari invoice pending milik user
      const invoice = Object.values(deposits).find(
        d => d.user_id === userId && d.status === "pending"
      );

      if (!invoice) {
        return ctx.reply(
`❌ *Tidak ada deposit yang bisa dibatalkan.*

Kamu tidak memiliki invoice deposit
dengan status *PENDING*.`,
          { parse_mode: "Markdown" }
        );
      }

      // Batalkan invoice
      invoice.status = "cancelled";
      invoice.cancelled_at = Date.now();

      // Bersihkan state deposit (in-memory)
      clearDepositState(ctx.from.id);

      return ctx.reply(
`✅ *Deposit berhasil dibatalkan.*

ID Invoice : ${invoice.invoice_id}
Nominal    : Rp${invoice.amount.toLocaleString("id-ID")}
Status     : CANCELLED

Kamu sekarang bisa melakukan
deposit baru dengan /deposit.`,
        { parse_mode: "Markdown" }
      );
    }
  );
};