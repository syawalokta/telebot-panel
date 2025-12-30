import permission from "../lib/permission.js";
import api from "../lib/api.js";
import config from "../config.js";
import { generateExpired } from "../lib/expired.js";

function findUserByPanelId(db, panelUserId) {
  for (const user of Object.values(db.users)) {
    if (user.panel?.user_id === Number(panelUserId)) {
      return user;
    }
  }
  return null;
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default bot => {
  bot.command(
    "addsrv",
    permission(["owner", "admin"]),
    async ctx => {
      try {
        const input = ctx.message.text.replace("/addsrv", "").trim();
        const [panelUserId, serverName, ram, disk, cpu, expired] =
          input.split(",").map(v => v?.trim());

        // ===== VALIDASI INPUT =====
        if (!panelUserId || !serverName || !ram || !disk || !cpu || !expired) {
          return ctx.reply(
            "❌ Format salah\n\n/addsrv idpanel,namaserver,ram,disk,cpu,expired"
          );
        }

        if (![panelUserId, ram, disk, cpu, expired].every(v => /^\d+$/.test(v))) {
          return ctx.reply("❌ idpanel, ram, disk, cpu, expired harus angka.");
        }

        const user = findUserByPanelId(ctx.db, panelUserId);
        if (!user) {
          return ctx.reply(
            "❌ User dengan Panel User ID tersebut tidak ditemukan."
          );
        }

        if (!["customer", "owner"].includes(user.telegram.role)) {
          return ctx.reply(
            "❌ Server hanya bisa dibuat untuk user CUSTOMER atau OWNER."
          );
        }

        if (!user.panel?.user_id) {
          return ctx.reply("❌ User belum memiliki akun panel.");
        }
        
        const expiredDays = Number(expired);
        const expiredData = generateExpired(expiredDays);
        const expiredDateText = formatDate(expiredData.expired_at);

        const description =
`Expired date: ${expiredDateText}
Tenant: (@${user.telegram.username})`;

        const res = await api.post("/servers", {
          name: serverName,
          description,
          user: user.panel.user_id,
          egg: config.DEFAULT_EGG_ID,

          docker_image: "docker.io/bionicc/nodejs-wabot:latest",
          startup: "{{STARTUP_CMD}}",
          environment: {
            STARTUP_CMD: "bash" // atau "npm start"
          },

          limits: {
            memory: Number(ram),
            swap: 0,
            disk: Number(disk),
            io: 500,
            cpu: Number(cpu)
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

        const server = res.data.attributes;

        if (!user.servers) user.servers = [];

        user.servers.push({
          server_id: server.identifier,
          panel_id: server.id,
          name: server.name,
          description,
          resource: {
            ram: Number(ram),
            disk: Number(disk),
            cpu: Number(cpu)
          },
          expired: expiredData
        });

        await ctx.reply(
`✅ *Server berhasil dibuat*

Pemilik   : @${user.telegram.username}
Panel UID : ${user.panel.user_id}

Nama      : ${server.name}
Server ID : ${server.identifier}

RAM       : ${ram} MB
Disk      : ${disk} MB
CPU       : ${cpu} %
Expired   : ${expiredData.text}
Tanggal   : ${expiredDateText}`,
          { parse_mode: "Markdown" }
        );

        // ===== NOTIFIKASI KE USER =====
        try {
          await bot.telegram.sendMessage(
            user.telegram.id,
`🎉 *Server kamu berhasil dibuat*

Nama      : ${server.name}
Server ID : ${server.identifier}
Expired   : ${expiredData.text}
Tanggal   : ${expiredDateText}

*Spesifikasi*
RAM  : ${ram} MB
Disk : ${disk} MB
CPU  : ${cpu} %`,
            { parse_mode: "Markdown" }
          );
        } catch (_) {}

      } catch (err) {
        console.error("ADDSRV ERROR:", err?.response?.data || err);
        ctx.reply("❌ Gagal membuat server.");
      }
    }
  );
};