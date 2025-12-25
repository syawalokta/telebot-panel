import permission from "../lib/permission.js";

export default bot => {
  bot.command(
    "listcommand",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      const role = ctx.db.users[ctx.from.id]?.telegram?.role || "user";

      let msg =
`📜 *DAFTAR COMMAND BOT*

`;

      // ===== USER =====
      msg +=
`👤 *USER*
/start – Perkenalan bot
/profile – Profil & statistik akun
/mysrv – Lihat server milikmu
/pricelist – Lihat paket & harga
/listcommand – Daftar command

`;

      // ===== CUSTOMER =====
      if (["customer", "admin", "owner"].includes(role)) {
        msg +=
`💼 *CUSTOMER*
/saldo – Cek saldo
/startsrv <id> – Nyalakan server
/stopsrv <id> – Matikan server

`;
      }

      // ===== ADMIN =====
      if (["admin", "owner"].includes(role)) {
        msg +=
`🛠️ *ADMIN*
/addsrv – Tambah server
/deleteserver – Hapus server
/listsrv – List semua server

`;
      }

      // ===== OWNER =====
      if (role === "owner") {
        msg +=
`👑 *OWNER*
/createuser – Buat user panel
/deleteuser – Hapus user panel
/listuser – List user panel
/listadmin – List admin panel

`;
      }

      ctx.reply(msg, { parse_mode: "Markdown" });
    }
  );
};