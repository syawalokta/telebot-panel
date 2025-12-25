import permission from "../lib/permission.js";

/**
 * Format rupiah
 */
function formatRupiah(num = 0) {
  return "Rp " + num.toLocaleString("id-ID");
}

export default bot => {
  bot.command(
    "addsaldo",
    permission(["owner", "admin"]),
    ctx => {
      const input = ctx.message.text.replace("/addsaldo", "").trim();
      const [id, amount] = input.split(",").map(v => v?.trim());

      // ===== VALIDASI INPUT =====
      if (!id || !amount) {
        return ctx.reply(
          "❌ Format salah\n\n/addsaldo idtele,nominal"
        );
      }

      if (!/^\d+$/.test(id) || !/^\d+$/.test(amount)) {
        return ctx.reply("❌ ID dan nominal harus berupa angka.");
      }

      const nominal = Number(amount);
      if (nominal <= 0) {
        return ctx.reply("❌ Nominal harus lebih dari 0.");
      }

      const user = ctx.db.users[id];
      if (!user) {
        return ctx.reply("❌ User belum terdaftar. Pastikan user sudah /start.");
      }

      // ===== PASTIKAN WALLET ADA =====
      if (!user.wallet) {
        user.wallet = {
          balance: 0,
          history: []
        };
      }

      // ===== TAMBAH SALDO =====
      user.wallet.balance += nominal;

      user.wallet.history.push({
        type: "deposit",
        amount: nominal,
        note: "Deposit manual oleh admin",
        by: ctx.from.id.toString(),
        date: Date.now()
      });

      // ===== RESPONSE KE ADMIN =====
      ctx.reply(
`✅ *Saldo berhasil ditambahkan*

User     : @${user.telegram.username}
ID       : ${id}
Nominal  : ${formatRupiah(nominal)}
Saldo    : ${formatRupiah(user.wallet.balance)}`,
        { parse_mode: "Markdown" }
      );

      // ===== NOTIFIKASI KE USER =====
      try {
        bot.telegram.sendMessage(
          id,
`💰 *Saldo Masuk*

Nominal : ${formatRupiah(nominal)}
Saldo   : ${formatRupiah(user.wallet.balance)}

Terima kasih telah melakukan deposit.`,
          { parse_mode: "Markdown" }
        );
      } catch (_) {}
    }
  );
};