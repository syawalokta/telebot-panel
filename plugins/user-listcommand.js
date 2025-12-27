import fs from "fs";
import permission from "../lib/permission.js";

const PLUGIN_DIR = "./plugins";
const VALID_ROLES = ["user", "cust", "admin", "owner"];

/**
 * Ambil semua command dari nama file plugin
 */
function getAllCommands() {
  const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith(".js"));

  return files
    .map(file => {
      const name = file.replace(".js", "");
      const [role, ...rest] = name.split("-");

      // skip file yang tidak sesuai konvensi
      if (!VALID_ROLES.includes(role) || rest.length === 0) {
        return null;
      }

      return {
        role,
        command: "/" + rest.join("-")
      };
    })
    .filter(Boolean);
}

/**
 * Role hierarchy
 */
function canSee(userRole, cmdRole) {
  const hierarchy = ["user", "cust", "admin", "owner"];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(cmdRole);
}

export default bot => {
  bot.command(
    "listcommand",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const rawRole =
        ctx.db.users[ctx.from.id]?.telegram?.role || "user";

      // samakan role db ke prefix
      const userRole = rawRole === "customer" ? "cust" : rawRole;

      const commands = getAllCommands();

      let msg = `📜 *DAFTAR COMMAND BOT*\n`;

      const sections = [
        { role: "user", title: "👤 *USER*" },
        { role: "cust", title: "💼 *CUSTOMER*" },
        { role: "admin", title: "🛠️ *ADMIN*" },
        { role: "owner", title: "👑 *OWNER*" }
      ];

      for (const section of sections) {
        if (!canSee(userRole, section.role)) continue;

        const list = commands
          .filter(c => c.role === section.role)
          .map(c => c.command);

        if (list.length === 0) continue;

        msg += `\n${section.title}\n`;
        for (const cmd of list) {
          msg += `${cmd}\n`;
        }
      }

      return ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );
};