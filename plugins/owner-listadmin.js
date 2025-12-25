import api from "../lib/api.js";
import permission from "../lib/permission.js";
import { Markup } from "telegraf";

const PER_PAGE = 5;

/**
 * Ambil semua admin panel (root_admin)
 */
async function fetchAdmins() {
  let page = 1;
  let admins = [];
  let totalPages = 1;

  do {
    const res = await api.get("/users", { params: { page } });
    const data = res.data.data;

    admins.push(
      ...data.filter(u => u.attributes.root_admin === true)
    );

    totalPages = res.data.meta.pagination.total_pages;
    page++;
  } while (page <= totalPages);

  return admins;
}

function renderAdmins(admins, page = 1) {
  const start = (page - 1) * PER_PAGE;
  const sliced = admins.slice(start, start + PER_PAGE);

  let text = "📋 LIST ADMIN PANEL\n\n";

  if (sliced.length === 0) {
    text += "Tidak ada admin panel.";
    return { text };
  }

  for (const u of sliced) {
    text +=
`ID USER   : ${u.attributes.id}
NAMA USER : ${u.attributes.username}
EMAIL USER: ${u.attributes.email}

`;
  }

  const buttons = [];

  if (page > 1) {
    buttons.push(
      Markup.button.callback("⬅️ Prev", `listadmin:${page - 1}`)
    );
  }

  if (start + PER_PAGE < admins.length) {
    buttons.push(
      Markup.button.callback("Next ➡️", `listadmin:${page + 1}`)
    );
  }

  return {
    text,
    keyboard:
      buttons.length > 0
        ? Markup.inlineKeyboard(buttons)
        : undefined
  };
}

export default bot => {
  // /listadmin command
  bot.command(
    "listadmin",
    permission(["owner"]),
    async ctx => {
      const admins = await fetchAdmins();
      ctx.session = ctx.session || {};
      ctx.session.listadmin = admins;

      const { text, keyboard } = renderAdmins(admins, 1);
      await ctx.reply(text, keyboard);
    }
  );

  // Pagination callback
  bot.action(
    /^listadmin:(\d+)$/,
    permission(["owner"]),
    async ctx => {
      const page = Number(ctx.match[1]);
      await ctx.answerCbQuery();

      const admins = ctx.session?.listadmin;
      if (!admins) {
        return ctx.editMessageText("❌ Data kadaluarsa. Jalankan /listadmin ulang.");
      }

      const { text, keyboard } = renderAdmins(admins, page);
      await ctx.editMessageText(text, keyboard);
    }
  );
};