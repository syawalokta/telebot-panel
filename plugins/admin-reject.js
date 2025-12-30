import permission from "../lib/permission.js";

export default bot => {
  bot.command(
    "reject",
    permission(["owner", "admin"]),
    async ctx => {
      const input = ctx.message.text.replace("/reject", "").trim();
      const [invoiceIdRaw, reasonRaw] = input.split(",");

      const invoiceId = invoiceIdRaw?.trim();
      const reason =
        reasonRaw?.trim() || "Deposit tidak valid atau dana belum masuk.";

      if (!invoiceId) {
        return ctx.reply(
          "❌ Format salah\n\n/reject IDINVOICE,alasan (opsional)"
        );
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

      // Update status deposit
      deposit.status = "rejected";
      deposit.rejected_at = Date.now();
      deposit.rejected_by = ctx.from.id.toString();
      deposit.reason = reason;

      await ctx.reply(
`❌ *DEPOSIT DITOLAK*

User      : @${deposit.username}
ID        : ${deposit.user_id}
Invoice   : ${invoiceId}
Nominal   : Rp${deposit.amount.toLocaleString("id-ID")}
Metode    : ${deposit.method}

Alasan:
${reason}`,
        { parse_mode: "Markdown" }
      );

      try {
        await bot.telegram.sendMessage(
          deposit.user_id,
`❌ *Deposit Gagal*

Invoice : ${invoiceId}
Nominal : Rp${deposit.amount.toLocaleString("id-ID")}
Metode  : ${deposit.method}

Alasan:
${reason}

Jika ada pertanyaan, silakan hubungi admin.`,
          { parse_mode: "Markdown" }
        );
      } catch (_) {}

    }
  );
};