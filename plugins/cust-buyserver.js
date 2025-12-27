import permission from "../lib/permission.js";
import api from "../lib/api.js";
import config from "../config.js";
import { PACKAGES } from "../lib/packages.js";

/**
 * Generate password panel
 */
function randomPassword() {
  return Math.random().toString(36).slice(-10);
}

export default bot => {
  bot.command(
    "buyserver",
    permission(["user", "customer", "admin", "owner"]),
    async ctx => {
      try {
        const input = ctx.message.text.replace("/buyserver", "").trim();
        const [orderId, serverName] = input.split(",").map(v => v?.trim());

        if (!orderId || !serverName) {
          return ctx.reply(
            "❌ Format salah\n\n/buyserver ID_PESANAN,NAMA_SERVER"
          );
        }

        const pkg = PACKAGES[orderId.toUpperCase()];
        if (!pkg) {
          return ctx.reply("❌ ID Pesanan tidak valid.");
        }

        const user = ctx.db.users[ctx.from.id];

        // =====================
        // 🔒 NORMALISASI WALLET (INI KUNCI)
        // =====================
        user.wallet ??= { balance: 0, history: [] };
        user.wallet.balance = Number(user.wallet.balance || 0);

        if (user.wallet.balance < pkg.price) {
          return ctx.reply(
`❌ Saldo tidak mencukupi

Harga paket : Rp${pkg.price.toLocaleString("id-ID")}
Saldo kamu  : Rp${user.wallet.balance.toLocaleString("id-ID")}`
          );
        }

        // =====================
        // USER PANEL
        // =====================
        let panelUserId = user.panel?.user_id;
        let panelPassword = null;

        if (!panelUserId) {
          const password = randomPassword();

          const resUser = await api.post("/users", {
            email: `${ctx.from.id}@user.voltrapedia`,
            username: `user_${ctx.from.id}`,
            first_name: ctx.from.first_name || "User",
            last_name: "Voltra",
            password
          });

          panelUserId = resUser.data.attributes.id;
          panelPassword = password;

          user.panel = {
            user_id: panelUserId,
            email: `${ctx.from.id}@user.voltrapedia`
          };

          // JANGAN UBAH OWNER
          if (user.telegram.role === "user") {
            user.telegram.role = "customer";
          }
        }

        // =====================
        // CREATE SERVER
        // =====================
        const resServer = await api.post("/servers", {
          name: serverName,
          user: panelUserId,
          egg: config.DEFAULT_EGG_ID,
          docker_image: "docker.io/bionicc/nodejs-wabot:latest",
          startup: "{{STARTUP_CMD}}",
          environment: {
            STARTUP_CMD: "bash"
          },
          limits: {
            memory: pkg.ram,
            swap: 0,
            disk: pkg.disk,
            io: 500,
            cpu: pkg.cpu
          },
          feature_limits: {
            databases: 1,
            backups: 1,
            allocations: 1
          },
          deploy: {
            locations: [config.DEFAULT_LOCATION_ID],
            dedicated_ip: false,
            port_range: []
          }
        });

        const server = resServer.data.attributes;

        // =====================
        // SAVE DATABASE
        // ====================
        user.servers.push({
          server_id: server.identifier,
          panel_id: server.id,
          name: server.name,
          package: orderId,
          
          resource: {
           ram: pkg.ram,
           disk: pkg.disk,
           cpu: pkg.cpu
          },
          
          expired: {
           duration: "30 hari",
           expired_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
           text: "30 hari"
          }
        });

        // POTONG SALDO + CATAT HISTORY
        user.wallet.balance -= pkg.price;
        user.wallet.history.push({
          type: "buyserver",
          amount: pkg.price,
          note: `Beli server ${pkg.name}`,
          by: ctx.from.id.toString(),
          date: Date.now()
        });

        // =====================
        // RESPONSE USER
        // =====================
        let msg =
`✅ *SERVER BERHASIL DIBELI*

📦 Paket     : ${pkg.name}
🖥 Server    : ${server.name}
🆔 Server ID : ${server.identifier}

RAM  : ${pkg.ram} MB
Disk : ${pkg.disk} MB
CPU  : ${pkg.cpu === 0 ? "Unlimited" : pkg.cpu + "%"}

💰 Harga : Rp${pkg.price.toLocaleString("id-ID")}
💳 Sisa Saldo : Rp${user.wallet.balance.toLocaleString("id-ID")}
`;

        if (panelPassword) {
          msg +=
`
━━━━━━━━━━━━━━━
🔐 *AKUN PANEL*
Email    : ${user.panel.email}
Password : ${panelPassword}
`;
        }

        msg += `\nGunakan /mysrv untuk melihat server kamu.`;

        return ctx.reply(msg, { parse_mode: "Markdown" });

      } catch (err) {
        console.error("BUYSERVER ERROR:", err);
        return ctx.reply("❌ Gagal memproses pembelian server.");
      }
    }
  );
};