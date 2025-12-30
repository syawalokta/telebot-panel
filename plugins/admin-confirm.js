import permission from "../lib/permission.js";

function formatRupiah(num = 0) {
  return "Rp " + num.toLocaleString("id-ID");
}

export default bot => {
  bot.command(
    "confirm",
    permission(["owner", "admin"]),
    async ctx => {
      const invoiceId = ctx.message.text.split(" ")[1];

      if (!invoiceId) {
        return ctx.reply("❌ Format salah\n\n/confirm IDINVOICE");
      }

      const deposit = ctx.db.deposits?.[invoiceId];

      if (!deposit) {
        return ctx.reply("❌ Invoice tidak ditemukan.");
      }

      if (deposit.status !== "pending") {
        return ctx.reply(
          `❌ Deposit sudah diproses\nStatus: ${deposit.status.toUpperCase()}`
        );
      }

      if (!deposit.proof) {
        return ctx.reply("❌ Bukti transfer belum dikirim user.");
      }

      const user = ctx.db.users[deposit.user_id];
      if (!user) {
        return ctx.reply("❌ User tidak ditemukan di database.");
      }

      if (!user.wallet) {
        user.wallet = {
          balance: 0,
          history: []
        };
      }

      user.wallet.balance += deposit.amount;

      user.wallet.history.push({
        type: "deposit",
        amount: deposit.amount,
        method: deposit.method,
        invoice: invoiceId,
        status: "success",
        by: ctx.from.id.toString(),
        date: Date.now()
      });

      deposit.status = "success";
      deposit.confirmed_at = Date.now();
      deposit.confirmed_by = ctx.from.id.toString();

      await ctx.reply(
`✅ *DEPOSIT DIKONFIRMASI*

User      : @${deposit.username}
ID        : ${deposit.user_id}
Invoice   : ${invoiceId}
Nominal   : ${formatRupiah(deposit.amount)}
Metode    : ${deposit.method}

Saldo user sekarang:
${formatRupiah(user.wallet.balance)}`,
        { parse_mode: "Markdown" }
      );

      try {
        await bot.telegram.sendMessage(
          deposit.user_id,
`✅ *Deposit Berhasil*

Invoice : ${invoiceId}
Nominal : ${formatRupiah(deposit.amount)}
Metode  : ${deposit.method}

Saldo kamu sudah bertambah.
Terima kasih 🙏`,
          { parse_mode: "Markdown" }
        );
      } catch (_) {}

    }
  );
};