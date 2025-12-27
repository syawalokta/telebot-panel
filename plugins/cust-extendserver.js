import permission from "../lib/permission.js";
import api from "../lib/api.js";
import { PACKAGES } from "../lib/packages.js";

/**
 * Format timestamp ke DD/MM/YYYY
 */
function formatDate(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// STATE KONFIRMASI (IN-MEMORY)
const confirmState = {};

export default bot => {
  /**
   * =========================
   * /extendserver SERVER_ID
   * =========================
   */
  bot.command(
    "extendserver",
    permission(["customer", "admin", "owner"]),
    ctx => {
      const input = ctx.message.text.replace("/extendserver", "").trim();
      if (!input) {
        return ctx.reply("❌ Format:\n/extendserver SERVER_ID");
      }

      const user = ctx.db.users[ctx.from.id];
      const server = user.servers?.find(s => s.server_id === input);

      if (!server) {
        return ctx.reply("❌ Server tidak ditemukan.");
      }

      const pkg = PACKAGES[server.package];
      if (!pkg || !pkg.extend) {
        return ctx.reply("❌ Server ini tidak mendukung perpanjangan.");
      }

      // SIMPAN STATE KONFIRMASI
      confirmState[ctx.from.id] = {
        serverId: server.server_id
      };

      const currentExpired =
        server.expired?.expired_at || Date.now();

      const newExpired =
        currentExpired + 30 * 24 * 60 * 60 * 1000;

      return ctx.reply(
`🔄 *PERPANJANG SERVER*

Nama Server : ${server.name}
Server ID   : ${server.server_id}

Paket       : ${pkg.name}
Harga Extend: Rp${pkg.extend.toLocaleString("id-ID")}

Expired Saat Ini : ${formatDate(currentExpired)}
Expired Baru     : ${formatDate(newExpired)}

Ketik *lanjut* untuk konfirmasi  
Ketik *batal* untuk membatalkan`,
        { parse_mode: "Markdown" }
      );
    }
  );

  /**
   * ==================================
   * HANDLE KONFIRMASI (lanjut / batal)
   * ==================================
   */
  bot.use(async (ctx, next) => {
    // HANYA TEXT BIASA
    if (!ctx.message?.text) return next();

    // JANGAN SENTUH COMMAND
    if (ctx.message.text.startsWith("/")) return next();

    const state = confirmState[ctx.from.id];
    if (!state) return next();

    const text = ctx.message.text.toLowerCase();
    if (text !== "lanjut" && text !== "batal") return next();

    const user = ctx.db.users[ctx.from.id];
    const server = user.servers?.find(
      s => s.server_id === state.serverId
    );

    // HAPUS STATE
    delete confirmState[ctx.from.id];

    if (!server) {
      await ctx.reply("❌ Server tidak ditemukan.");
      return;
    }

    // BATAL
    if (text === "batal") {
      await ctx.reply("❌ Perpanjangan server dibatalkan.");
      return;
    }

    // =====================
    // PROSES EXTEND
    // =====================
    const pkg = PACKAGES[server.package];

    // NORMALISASI WALLET
    user.wallet ??= { balance: 0, history: [] };
    user.wallet.balance = Number(user.wallet.balance || 0);

    if (user.wallet.balance < pkg.extend) {
      await ctx.reply(
`❌ Saldo tidak mencukupi

Harga extend : Rp${pkg.extend.toLocaleString("id-ID")}
Saldo kamu   : Rp${user.wallet.balance.toLocaleString("id-ID")}`
      );
      return;
    }

    // HITUNG EXPIRED BARU
    const baseExpired =
      server.expired?.expired_at && server.expired.expired_at > Date.now()
        ? server.expired.expired_at
        : Date.now();

    const newExpiredAt =
      baseExpired + 30 * 24 * 60 * 60 * 1000;

    const expiredDate = formatDate(newExpiredAt);

    // UPDATE DATABASE
    server.expired = {
      duration: "30 Hari",
      expired_at: newExpiredAt,
      text: "30 Hari"
    };

    // UPDATE DESCRIPTION PANEL
    const description =
`Expired date: ${expiredDate}
Tenant: (@${user.telegram.username})`;
    
    try {
  await api.patch(`/servers/${server.panel_id}/details`, {
    name: server.name,
    user: user.panel.user_id,
    description
  });
} catch (err) {
  console.error(
    "EXTEND DESC UPDATE ERROR:",
    err?.response?.data || err.message
  );
}

    // POTONG SALDO + HISTORY
    user.wallet.balance -= pkg.extend;
    user.wallet.history.push({
      type: "extendserver",
      amount: pkg.extend,
      note: `Extend server ${server.name}`,
      by: ctx.from.id.toString(),
      date: Date.now()
    });

    return ctx.reply(
`✅ *SERVER BERHASIL DIPERPANJANG*

Nama Server : ${server.name}
Server ID   : ${server.server_id}

Expired Baru : ${expiredDate}

💰 Biaya Extend : Rp${pkg.extend.toLocaleString("id-ID")}
💳 Sisa Saldo   : Rp${user.wallet.balance.toLocaleString("id-ID")}`,
      { parse_mode: "Markdown" }
    );
  });
};