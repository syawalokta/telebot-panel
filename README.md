🤖 Telegram Pterodactyl Manager Bot

Bot Telegram berbasis Node.js + Telegraf untuk mengelola Pterodactyl Panel secara otomatis melalui Telegram. Dirancang dengan arsitektur plugin, role & permission, serta database lokal yang ringan dan mudah dikembangkan.


### 🔐 Role & Permission
- user → info dasar
- customer → kelola server milik sendiri
- admin → manajemen server terbatas
- owner → full akses
### 🖥️ Manajemen Server (Pterodactyl)
- Create server
- Delete server
- List server
- Start / Stop server
- Extend server (+30 hari)
### 👤 Manajemen User
- Auto register user saat /start
- Auto create akun panel saat beli server
- 1 user Telegram = 1 akun panel
### 💰 Sistem Saldo & Deposit
- Wallet user (saldo & history)
- Deposit manual (invoice + bukti transfer)
- Konfirmasi / penolakan oleh owner
### 🛒 Hosting & Billing
- Pricelist hosting
- Buy server otomatis (/buyserver)
- Potong saldo otomatis

## #File Structure 

    ├── lib/-
    │   ├── api.js
    │   ├── atlanticApi.js
    │   ├── clientApi.js
    │   ├── database.js
    │   ├── deposit.js
    │   ├── escape.js
    │   ├── expired.js
    │   ├── packages.js
    │   └── permission.js
    ├── plugins/-
    │   ├── admin-addsaldo.js
    │   ├── admin-addsrv.js
    │   ├── admin-confirm.js
    │   ├── admin-deletesrv.js
    │   ├── admin-invoice.js
    │   ├── admin-listsrv.js
    │   ├── admin-reject.js
    │   ├── cust-buyserver.js
    │   ├── cust-extendserver.js
    │   ├── cust-mysrv.js
    │   ├── cust-startsrv.js
    │   ├── cust-stopsrv.js
    │   ├── owner-confirmdeposit.js
    │   ├── owner-createuser.js
    │   ├── owner-deleteuser.js
    │   ├── owner-gatewayprofile.js
    │   ├── owner-listadmin.js
    │   ├── owner-listuser.js
    │   ├── user-canceldeposit.js
    │   ├── user-deposit.js
    │   ├── user-listcommand.js
    │   ├── user-pricelist.js
    │   ├── user-profile.js
    │   ├── user-saldo.js
    │   └── user-start.js
    ├── .gitignore
    ├── cachelog.txt
    ├── config.js
    ├── database.json
    ├── example.config.js
    ├── handler.js
    ├── index.js
    ├── main.js
    ├── package-lock.json
    ├── package.json
    └── README.md


⚙️ Konfigurasi
```
export default {
  BOT_TOKEN: "YOUR_BOT_TOKEN",
  OWNER_ID: "YOUR_TELEGRAM_ID",
  OWNER_USERNAME: "yourusername",
  CHANNEL_URL: "https:                    
  PANEL_URL: "//t.me/yourchannel",
  PANEL_URL: "https://panel.yourdomain.com",
  APPLICATION_API_KEY: "ptla_xxxxx",
  CLIENT_API_KEY: "ptlc_xxxxx",
  DEFAULT_LOCATION_ID: 1,
  DEFAULT_EGG_ID: 17,
  DEPOSIT: {
    MIN: 5000,
    TIMEOUT: 5 * 60 * 1000,
    TARGET: {
      DANA: { number: "08xxxx", name: "Nama" },
      GOPAY: { number: "08xxxx", name: "Nama" },
      QRIS: { link: "https://qris.link", name: "Merchant" }
    }
  },
  DEBUG: true
};
```
🚀 Instalasi
```
git clone https://github.com/syawalokta/telebot-panel
cd telebot-panel
cp example.config.js config.js
npm install
npm start
```
📜 Daftar Command
```
- User: /start, /profile, /saldo, /mysrv, /pricelist, /listcommand
- Customer: /buyserver, /extendserver, /startsrv, /stopsrv, /deposit
- Admin: /addsrv, /deleteserver, /listsrv, /addsaldo
- Owner: /createuser, /deleteuser, /listuser, /confirm, /reject
```
🛡️ Keamanan & Stabilitas

- Escape Markdown (anti crash nama user)
- Ignore message lama
- Auto save database
- Proteksi command konflik
- Hardening owner role

📄 Lisensi

MIT License — bebas digunakan & dikembangkan.