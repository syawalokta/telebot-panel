import permission from "../lib/permission.js";

export default bot => {
  bot.command(
    "pricelist",
    permission(["user", "customer", "admin", "owner"]),
    ctx => {
      return ctx.reply(
`🚀 *Voltrapedia Pterodactyl Hosting NodeJS* 🚀

Solusi hosting *NodeJS* stabil, ringan, dan terjangkau untuk:
Bot Telegram • Automation • API • Project pribadi  
Menggunakan *Pterodactyl Panel* dengan environment siap pakai tanpa ribet install ulang.

━━━━━━━━━━━━━━━
✨ *Akses Mudah via Bot Telegram*
Kelola server langsung dari Telegram:
✔ Start / Stop / Restart Server  
✔ Monitoring RAM, CPU, Disk  
✔ Akses cepat & praktis kapan saja  

━━━━━━━━━━━━━━━
💡 *Paket Lite*
Cocok untuk bot ringan & testing

• *Lite V0.5*  
RAM 1GB | Disk 1.5GB | CPU 50%  
💰 Rp6.500  
Extend: Rp5.000  
🆔 ID Pesanan: *VLTR1*

• *Lite V1*  
RAM 1.5GB | Disk 2.5GB | CPU 65%  
💰 Rp9.500  
Extend: Rp8.000  
🆔 ID Pesanan: *VLTR2*

• *Lite V2*  
RAM 2GB | Disk 2.5GB | CPU 70%  
💰 Rp14.500  
Extend: Rp12.000  
🆔 ID Pesanan: *VLTR3*

━━━━━━━━━━━━━━━
📦 *Paket Standar*
Untuk bot aktif & aplikasi menengah

• *Standar V1*  
RAM 3.5GB | Disk 4GB | CPU 90%  
💰 Rp18.500  
Extend: Rp15.000  
🆔 ID Pesanan: *VLTR4*

• *Standar V2*  
RAM 4.5GB | Disk 4.5GB | CPU 125%  
💰 Rp25.500  
Extend: Rp20.000  
🆔 ID Pesanan: *VLTR5*

━━━━━━━━━━━━━━━
🌟 *Paket Premium*
Performa maksimal & multitasking

• *Premium V1*  
RAM 5GB | Disk 6.5GB | CPU 170%  
💰 Rp35.500  
Extend: Rp30.000  
🆔 ID Pesanan: *VLTR6*

• *Premium V2*  
RAM 6GB | Disk 10GB | CPU Unlimited  
💰 Rp51.500  
Extend: Rp45.000  
🆔 ID Pesanan: *VLTR7*

━━━━━━━━━━━━━━━
🛠️ *Software Sudah Terinstall*
FFMPEG • ImageMagick • Python3 & Pip  
Puppeteer • Chromium • PM2  
NPM & Yarn • Speedtest-net • DLL  

━━━━━━━━━━━━━━━
📅 Masa Aktif : 30 Hari  
🛡️ Garansi  : 29 Hari  

━━━━━━━━━━━━━━━
🛒 *Cara Membeli Server*
Gunakan perintah berikut:
\`/buyserver ID_PESANAN,NAMA_SERVER\`

Contoh:
\`/buyserver VLTR2,MyBotNode\`

━━━━━━━━━━━━━━━
⚠️ *Peraturan Penting*
❌ Dilarang menggunakan script DDoS  
❌ Pelanggaran → server dihapus tanpa refund  

📌 *Catatan*
• No team support  
• No tutorial  
• Membeli = sudah paham penggunaan`,
        {
          parse_mode: "Markdown"
        }
      );
    }
  );
};