import permission from "../lib/permission.js";

/**
 * Format Rupiah
 */
function formatRupiah(num = 0) {
  return "Rp " + num.toLocaleString("id-ID");
}

/**
 * Format timestamp ke DD/MM/YYYY HH:mm
 */
function formatDate(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, "0")}/${
    (d.getMonth() + 1).toString().padStart(2, "0")
  }/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${
    d.getMinutes().toString().padStart(2, "0")
  }`;
}

export default bot => {

  // ===============================
  // /invoicelist (PENDING ONLY)
  // ===============================
  bot.command(
    "invoicelist",
    permission(["owner", "admin"]),
    ctx => {
      const deposits = ctx.db.deposits || {};
      const pending = Object.values(deposits)
        .filter(d => d.status === "pending");

      if (pending.length === 0) {
        return ctx.reply("✅ Tidak ada invoice pending.");
      }

      let msg = "📋 *INVOICE PENDING*\n\n";

      for (const d of pending) {
        msg +=
`🧾 ${d.invoice_id}
User   : @${d.username}
Nominal: ${formatRupiah(d.amount)}
Metode : ${d.method}
Waktu  : ${formatDate(d.created_at)}

`;
      }

      msg += `Gunakan /confirm IDINVOICE atau /reject IDINVOICE,alasan`;

      ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );

  // ===============================
  // /invoicestatus (ALL)
  // ===============================
  bot.command(
    "invoicestatus",
    permission(["owner", "admin"]),
    ctx => {
      const deposits = ctx.db.deposits || {};
      const all = Object.values(deposits);

      if (all.length === 0) {
        return ctx.reply("❌ Belum ada invoice.");
      }

      let msg = "📦 *STATUS SEMUA INVOICE*\n\n";

      for (const d of all) {
        msg +=
`🧾 ${d.invoice_id}
User   : @${d.username}
Nominal: ${formatRupiah(d.amount)}
Metode : ${d.method}
Status : *${d.status.toUpperCase()}*
Dibuat : ${formatDate(d.created_at)}

`;
      }

      ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );

};