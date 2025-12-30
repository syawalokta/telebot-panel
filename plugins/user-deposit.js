import { Markup } from "telegraf";
import permission from "../lib/permission.js";
import {
  startManualDeposit,
  handleDepositText,
  handleDepositPhoto,
  handlePaymentMethod
} from "../lib/deposit.js";

export default bot => {

  bot.command(
    "deposit",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      ctx.reply(
`💰 *DEPOSIT SALDO*

Silakan pilih metode deposit:`,
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            [Markup.button.callback("💵 Deposit Manual", "deposit_manual")]
          ])
        }
      );
    }
  );

  bot.action("deposit_manual", ctx => {
    ctx.answerCbQuery();
    startManualDeposit(ctx);
  });

  bot.action(/^pay_/, handlePaymentMethod);

  bot.on("text", handleDepositText);

  bot.on("photo", handleDepositPhoto);
};