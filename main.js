import { Telegraf } from "telegraf";
import config from "./config.js";
import handler from "./handler.js";
import { readDB, writeDB } from "./lib/database.js";

const bot = new Telegraf(config.BOT_TOKEN);

const BOT_START_TIME = Date.now();

bot.use((ctx, next) => {
  if (ctx.message?.date) {
    const msgTime = ctx.message.date * 1000;
    if (msgTime < BOT_START_TIME) return;
  }
  return next();
});

bot.use((ctx, next) => {
  if (ctx.chat?.type !== "private") return;
  return next();
});

bot.use((ctx, next) => {
  ctx.db = readDB();
  return next();
});

bot.use((ctx, next) => {
  const id = ctx.from?.id?.toString();
  if (id && ctx.db.users[id] && id === config.OWNER_ID.toString()) {
    ctx.db.users[id].telegram.role = "owner";
  }
  return next();
});

// Auto save DB
bot.use(async (ctx, next) => {
  await next();
  writeDB(ctx.db);
});

handler(bot);

await bot.telegram.deleteWebhook({ drop_pending_updates: true });

bot.launch({
  drop_pending_updates: true
});

console.log("🤖 Bot berjalan dengan update dibersihkan");