import api from "../lib/api.js";
import permission from "../lib/permission.js";
import { Markup } from "telegraf";

const PER_PAGE = 5;

async function renderPage(ctx, page = 1, edit = false) {
  const res = await api.get("/users", {
    params: { page }
  });

  const users = res.data.data;
  const meta = res.data.meta.pagination;

  let text = "📋 LIST USER PANEL\n\n";

  for (const u of users) {
    text +=
`ID USER   : ${u.attributes.id}
NAMA USER : ${u.attributes.username}
EMAIL USER: ${u.attributes.email}

`;
  }

  // Pagination buttons
  const buttons = [];

  if (meta.current_page > 1) {
    buttons.push(
      Markup.button.callback(
        "⬅️ Prev",
        `listuser:${meta.current_page - 1}`
      )
    );
  }

  if (meta.current_page < meta.total_pages) {
    buttons.push(
      Markup.button.callback(
        "Next ➡️",
        `listuser:${meta.current_page + 1}`
      )
    );
  }

  const keyboard =
    buttons.length > 0
      ? Markup.inlineKeyboard(buttons)
      : undefined;

  if (edit) {
    return ctx.editMessageText(text, keyboard);
  }

  return ctx.reply(text, keyboard);
}

export default bot => {
  // Command /listuser
  bot.command(
    "listuser",
    permission(["owner"]),
    async ctx => {
      await renderPage(ctx, 1);
    }
  );

  // Callback pagination
  bot.action(
    /^listuser:(\d+)$/,
    permission(["owner"]),
    async ctx => {
      const page = Number(ctx.match[1]);
      await ctx.answerCbQuery();
      await renderPage(ctx, page, true);
    }
  );
};