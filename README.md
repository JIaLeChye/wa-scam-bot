# 🛡️ WA Scam Bot

[![GitHub](https://img.shields.io/badge/GitHub-JIaLeChye%2Fwa--scam--bot-blue?logo=github)](https://github.com/JIaLeChye/wa-scam-bot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Educational%20NonCommercial-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/JIaLeChye/wa-scam-bot?style=social)](https://github.com/JIaLeChye/wa-scam-bot/stargazers)

> 📢 **Updates:** View the full project history in [CHANGELOG.md](CHANGELOG.md).

WA Scam Bot is a moderation tool for WhatsApp groups. It connects to WhatsApp using the `@whiskeysockets/baileys` library, monitors incoming messages for scam patterns, and provides a real-time web dashboard to track activity.

## 📋 Current Features

- **Web Dashboard**: View connection status and real-time logs in a browser, with dark/light mode support.
- **Authentication**: Connect using QR Code scan or Phone Number Pairing Code.
- **Scam Detection**: Keyword and URL-based detection on incoming messages with a risk score.
- **Database-Driven Keywords**: Scam keywords are stored and managed in MongoDB — no code edits needed to update them.
- **Scam URL Tracking**: Detected URLs are stored and tracked with hit counts and sender history.
- **Message Logging**: Saves messages from non-whitelisted senders to MongoDB for review.
- **Whitelist System**: Trusted numbers bypass message logging and scam detection.
- **Session Management**: Automatically attempts to reconnect if the connection is lost.
- **DB Error Page**: Shows a maintenance page if MongoDB is unreachable at startup instead of crashing.

## 🗺️ Project Roadmap

- [x] Web Dashboard for logs and pairing.
- [x] QR Code and Pairing Code login support.
- [x] Keyword and URL-based scam detection.
- [x] Database-driven keyword and scam URL management.
- [ ] AI-based Pattern Matching for Scam URLs.
- [ ] Shared Database for Global Blacklisting.
- [ ] New Member Verification (Gatekeeper Mode).

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher
- **MongoDB**: Running locally or via a remote URI

### 1. Clone & Install
```bash
git clone https://github.com/JIaLeChye/wa-scam-bot.git
cd wa-scam-bot
npm install
```

### 2. Configure Environment
Create a `.env` file in the `src/` directory based on the example below. **Never commit this file.**
```
PORT=your_port_number
MongoDB_URI=your_mongodb_connection_string
KEYWORD_CACHE_TTL_MS=60000
```

### 3. Launch the Bot
```bash
npx tsx src/index.ts
```

### 4. Connect Your Account
Navigate to `http://localhost:3000` and choose your preferred method:

- **Option A**: Request a Pairing Code by entering your phone number (with country code).
- **Option B**: Scan the dynamic QR Code displayed on the dashboard.

### 5. Add Scam Keywords
Insert keywords into the `scamkeywords` MongoDB collection to start detection:
```js
db.scamkeywords.insertOne({ keyword: "free money", isActive: true })
```

## 🧰 Built With

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API library.
- [Express](https://expressjs.com/) - Web framework for the backend.
- [Socket.IO](https://socket.io/) - Real-time dashboard communication.
- [MongoDB + Mongoose](https://mongoosejs.com/) - Database for messages, keywords, and scam logs.
- [TypeScript](https://www.typescriptlang.org/) - Type-safe codebase.

## ⚠️ Disclaimer

This project is for educational and automated tooling purposes only. Users are responsible for adhering to WhatsApp's Terms of Service. The developers are not responsible for any account bans or misuse of this tool.

---

## 💡 Credits

This project was developed with the assistance of **[GitHub Copilot](https://github.com/features/copilot)**, an AI-powered code completion tool that helped accelerate development, generate boilerplate code, and provide intelligent suggestions throughout the building process.
