import { Markup } from "telegraf";
import permission from "../lib/permission.js";
import {
  startManualDeposit,
  handleDepositText,
  handleDepositPhoto,
  handlePaymentMethod
} from "../lib/deposit.js";

export default bot => {

  // /deposit
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

  // pilih manual
  bot.action("deposit_manual", ctx => {
    ctx.answerCbQuery();
    startManualDeposit(ctx);
  });

  // pilih metode bayar
  bot.action(/^pay_/, handlePaymentMethod);

  // text handler
  bot.on("text", handleDepositText);

  // photo handler
  bot.on("photo", handleDepositPhoto);
};