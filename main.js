import { Telegraf } from "telegraf";
import config from "./config.js";
import handler from "./handler.js";
import { initDB, readDB, writeDB } from "./lib/database.js";
import { autoExpireInvoices } from "./lib/deposit.js";

// =======================
// INIT DATABASE
// =======================
initDB();

// Auto-expire invoice tiap 1 menit
setInterval(() => {
  const db = readDB();
  autoExpireInvoices(db);
  writeDB(db);
}, 60 * 1000);

// =======================
// INIT BOT
// =======================
const bot = new Telegraf(config.BOT_TOKEN);
const BOT_START_TIME = Date.now();

// =======================
// DEBUG MODE
// =======================
if (config.DEBUG) {
  bot.use(async (ctx, next) => {
    console.log("──── DEBUG UPDATE ────");
    console.log("Type :", ctx.updateType);
    console.log("From :", ctx.from?.id, ctx.from?.username);
    console.log("Text :", ctx.message?.text);
    console.log("Data :", ctx.callbackQuery?.data);
    console.log("──── END DEBUG ──────");
    return next();
  });
}

// =======================
// IGNORE OLD MESSAGE
// =======================
bot.use((ctx, next) => {
  if (ctx.message?.date) {
    const msgTime = ctx.message.date * 1000;
    if (msgTime < BOT_START_TIME) return;
  }
  return next();
});

// =======================
// PRIVATE CHAT ONLY
// =======================
bot.use((ctx, next) => {
  if (ctx.chat?.type !== "private") return;
  return next();
});

// =======================
// INJECT DATABASE
// =======================
bot.use((ctx, next) => {
  ctx.db = readDB();
  return next();
});

// =======================
// OWNER HARDENING
// =======================
bot.use((ctx, next) => {
  const id = ctx.from?.id?.toString();
  if (id && ctx.db.users[id] && id === config.OWNER_ID.toString()) {
    ctx.db.users[id].telegram.role = "owner";
  }
  return next();
});

// =======================
// AUTO SAVE DATABASE
// =======================
bot.use(async (ctx, next) => {
  await next();
  writeDB(ctx.db);
});

// =======================
// LOAD PLUGINS
// =======================
handler(bot);

// =======================
// ERROR HANDLER
// =======================
bot.catch((err, ctx) => {
  console.error("🔥 BOT ERROR");
  console.error("Update:", JSON.stringify(ctx.update, null, 2));
  console.error(err);
});

// =======================
// LAUNCH BOT
// =======================
await bot.telegram.deleteWebhook({ drop_pending_updates: true });
bot.launch({ drop_pending_updates: true });

console.log("🤖 Bot berjalan dengan update dibersihkan");