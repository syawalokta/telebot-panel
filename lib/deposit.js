import { Markup } from "telegraf";
import config from "../config.js";

// =========================
// CONFIG
// =========================
const MIN_DEPOSIT = config.DEPOSIT.MIN;
const TIMEOUT = config.DEPOSIT.TIMEOUT;

// STATE sementara (in-memory)
const state = {};

// =========================
// HELPER
// =========================

/**
 * Ambil tujuan deposit berdasarkan metode
 */
function getDepositTarget(method) {
  return config.DEPOSIT.TARGET[method] || null;
}

/**
 * 🔒 Cek apakah user masih punya invoice pending
 */
function hasPendingInvoice(ctx) {
  const deposits = ctx.db.deposits || {};
  return Object.values(deposits).some(
    d =>
      d.user_id === ctx.from.id.toString() &&
      d.status === "pending"
  );
}

// =========================
// AUTO EXPIRE INVOICE
// =========================
export function autoExpireInvoices(db) {
  if (!db.deposits) return;

  const now = Date.now();
  for (const inv of Object.values(db.deposits)) {
    if (inv.status === "pending" && now > inv.expired_at) {
      inv.status = "expired";
      inv.expired_real_at = now;
    }
  }
}

// =========================
// START DEPOSIT
// =========================
export function startManualDeposit(ctx) {
  // ❌ Blok jika masih ada invoice pending
  if (hasPendingInvoice(ctx)) {
    return ctx.reply(
`⛔ *Deposit Ditolak*

Kamu masih memiliki *invoice deposit yang belum selesai*.

Silakan selesaikan pembayaran atau tunggu
admin melakukan *konfirmasi / penolakan*.`,
      { parse_mode: "Markdown" }
    );
  }

  state[ctx.from.id] = {
    step: "amount"
  };

  return ctx.reply(
`💵 *DEPOSIT MANUAL*

Kirim *NOMINAL DEPOSIT* (angka saja)
Minimal : Rp${MIN_DEPOSIT.toLocaleString("id-ID")}
Timeout : ${TIMEOUT / 60000} menit`,
    { parse_mode: "Markdown" }
  );
}

// =========================
// HANDLE TEXT (NOMINAL)
// =========================
export async function handleDepositText(ctx, next) {
  // ❗ WAJIB: pastikan ini pesan text biasa
  if (!ctx.message || typeof ctx.message.text !== "string") {
    return next();
  }

  // ❗ WAJIB: jangan pernah tangkap command
  if (ctx.message.text.startsWith("/")) {
    return next();
  }

  const s = state[ctx.from.id];
  if (!s) return next();

  // ❗ hanya proses saat step amount
  if (s.step !== "amount") {
    return next();
  }

  const amount = Number(ctx.message.text);
  if (!amount || amount < MIN_DEPOSIT) {
    await ctx.reply(
      `❌ Nominal minimal Rp${MIN_DEPOSIT.toLocaleString("id-ID")}`
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
}

// =========================
// HANDLE METODE BAYAR
// =========================
export async function handlePaymentMethod(ctx) {
  const s = state[ctx.from.id];
  if (!s || s.step !== "method") return;

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

  let targetText = "";

  if (method === "QRIS") {
    if (!target.link) {
      return ctx.reply("❌ Link QRIS belum dikonfigurasi.");
    }

    targetText =
`🔗 *QRIS PAYMENT*
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

Kirim *BUKTI TRANSFER (foto)* setelah pembayaran.

Gunakan /canceldeposit untuk membatalkan deposit`,
    {
      parse_mode: "Markdown",
      disable_web_page_preview: true
    }
  );
}

/**
 * Hapus state deposit user (dipakai oleh /canceldeposit)
 */
export function clearDepositState(userId) {
  delete state[userId];
}

// =========================
// HANDLE BUKTI TRANSFER
// =========================
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