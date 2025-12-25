import { Markup } from "telegraf";
import config from "../config.js";

// Ambil dari config
const MIN_DEPOSIT = config.DEPOSIT.MIN;
const TIMEOUT = config.DEPOSIT.TIMEOUT;

// STATE sementara (in-memory)
const state = {};

/**
 * Ambil tujuan deposit berdasarkan metode
 */
function getDepositTarget(method) {
  return config.DEPOSIT.TARGET[method] || null;
}

/**
 * 🔒 CEK APAKAH USER MASIH PUNYA INVOICE PENDING
 */
function hasPendingInvoice(ctx) {
  const deposits = ctx.db.deposits || {};
  return Object.values(deposits).some(
    d =>
      d.user_id === ctx.from.id.toString() &&
      d.status === "pending"
  );
}


/**
 * ⏱ AUTO EXPIRE INVOICE
 * Jalankan tiap 1 menit
 */
export function autoExpireInvoices(db) {
  const now = Date.now();
  if (!db.deposits) return;

  for (const inv of Object.values(db.deposits)) {
    if (inv.status === "pending" && now > inv.expired_at) {
      inv.status = "expired";
      inv.expired_real_at = now;
    }
  }
}

/**
 * Mulai deposit manual
 */
export function startManualDeposit(ctx) {
  // ❌ BLOK JIKA MASIH ADA INVOICE PENDING
  if (hasPendingInvoice(ctx)) {
    return ctx.reply(
`⛔ *Deposit Ditolak*

Kamu masih memiliki *invoice deposit yang belum selesai*.

Silakan selesaikan pembayaran atau tunggu
admin melakukan *konfirmasi / penolakan*.`,
      { parse_mode: "Markdown" }
    );
  }

  state[ctx.from.id] = { step: "amount" };

  return ctx.reply(
`💵 *DEPOSIT MANUAL*

Kirim *NOMINAL DEPOSIT* (angka saja)
Minimal: Rp${MIN_DEPOSIT.toLocaleString("id-ID")}
Timeout: ${TIMEOUT / 60000} menit`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Handle text (nominal)
 */
export async function handleDepositText(ctx, next) {
  const s = state[ctx.from.id];
  if (!s) return next();

  if (s.step === "amount") {
    const amount = Number(ctx.message.text);

    if (!amount || amount < MIN_DEPOSIT) {
      await ctx.reply(
        `❌ Nominal kurang dari minimal Rp${MIN_DEPOSIT.toLocaleString("id-ID")}`
      );
      return;
    }

    s.amount = amount;
    s.step = "method";

    await ctx.reply(
      "Pilih metode pembayaran:",
      Markup.inlineKeyboard([
        [
          Markup.button.callback("DANA", "pay_dana"),
          Markup.button.callback("GOPAY", "pay_gopay")
        ],
        [Markup.button.callback("QRIS", "pay_qris")]
      ])
    );
    return;
  }

  return next();
}

/**
 * Handle metode pembayaran
 */
export async function handlePaymentMethod(ctx) {
  const s = state[ctx.from.id];
  if (!s) return;

  const method = ctx.callbackQuery.data.replace("pay_", "").toUpperCase();
  const target = getDepositTarget(method);

  if (!target) {
    return ctx.reply("❌ Metode pembayaran tidak tersedia.");
  }

  const invoiceId = `INV-${Date.now()}`;

  ctx.db.deposits ??= {};
  ctx.db.deposits[invoiceId] = {
    invoice_id: invoiceId,
    user_id: ctx.from.id.toString(),
    username: ctx.from.username || "-",
    amount: s.amount,
    method,
    status: "pending",
    proof: null,
    created_at: Date.now(),
    expired_at: Date.now() + TIMEOUT
  };

  s.step = "proof";
  s.invoice = invoiceId;

  // ===== FORMAT TUJUAN TRANSFER =====
  let targetText = "";

  if (method === "QRIS") {
    if (!target.link) {
      return ctx.reply("❌ Link QRIS belum dikonfigurasi.");
    }

    targetText =
`🔗 *QRIS PAYMENT*
Klik link berikut untuk membayar:
${target.link}

Nama Merchant:
${target.name}`;
  } else {
    targetText =
`📌 *TUJUAN TRANSFER*
${method} : ${target.number}
Nama      : ${target.name}`;
  }

  await ctx.reply(
`🧾 *INVOICE DEPOSIT*

ID Invoice : ${invoiceId}
Nominal    : Rp${s.amount.toLocaleString("id-ID")}
Metode     : ${method}

${targetText}

⚠️ Transfer *SESUAI NOMINAL*
⏱ Batas waktu: ${TIMEOUT / 60000} menit

Kirim *BUKTI TRANSFER (foto)* setelah pembayaran.`,
    {
      parse_mode: "Markdown",
      disable_web_page_preview: true
    }
  );
}

/**
 * Handle bukti transfer
 */
export async function handleDepositPhoto(ctx, next) {
  const s = state[ctx.from.id];
  if (!s || s.step !== "proof") return next();

  const invoice = ctx.db.deposits?.[s.invoice];
  if (!invoice) return next();

  if (Date.now() > invoice.expired_at) {
    delete state[ctx.from.id];
    await ctx.reply("❌ Invoice sudah expired.");
    return;
  }

  const fileId = ctx.message.photo.at(-1).file_id;
  invoice.proof = fileId;

  // Kirim ke owner
  await ctx.telegram.sendPhoto(
    config.OWNER_ID,
    fileId,
    {
      caption:
`📥 *DEPOSIT MASUK*

User      : @${invoice.username}
ID        : ${invoice.user_id}
Nominal   : Rp${invoice.amount.toLocaleString("id-ID")}
Metode    : ${invoice.method}
ID Invoice: ${invoice.invoice_id}
Status    : *MENUNGGU KONFIRMASI*`,
      parse_mode: "Markdown"
    }
  );

  await ctx.reply("✅ Bukti diterima. Menunggu konfirmasi admin.");

  delete state[ctx.from.id];
}