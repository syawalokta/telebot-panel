import permission from "../lib/permission.js";

export default bot => {

  bot.command(
    "confirm",
    permission(["owner"]),
    ctx => {
      const invoiceId = ctx.message.text.split(" ")[1];
      const dep = ctx.db.deposits?.[invoiceId];
      if (!dep || dep.status !== "pending") {
        return ctx.reply("❌ Invoice tidak ditemukan / sudah diproses.");
      }

      const user = ctx.db.users[dep.user_id];
      user.wallet.balance += dep.amount;
      user.wallet.history.push({
        type: "deposit",
        amount: dep.amount,
        invoice: invoiceId,
        date: Date.now()
      });

      dep.status = "success";

      bot.telegram.sendMessage(
        dep.user_id,
        `✅ Deposit berhasil\nNominal: Rp${dep.amount.toLocaleString("id-ID")}`
      );

      ctx.reply("✅ Deposit dikonfirmasi.");
    }
  );

  bot.command(
    "reject",
    permission(["owner"]),
    ctx => {
      const [id, reason] = ctx.message.text.replace("/reject", "").split(",");
      const dep = ctx.db.deposits?.[id?.trim()];
      if (!dep) return ctx.reply("❌ Invoice tidak ditemukan.");

      dep.status = "rejected";

      bot.telegram.sendMessage(
        dep.user_id,
        `❌ Deposit ditolak\nAlasan: ${reason || "Tidak valid"}`
      );

      ctx.reply("❌ Deposit ditolak.");
    }
  );
};