# 🛡️ WA Scam Bot

[![GitHub](https://img.shields.io/badge/GitHub-JIaLeChye%2Fwa--scam--bot-blue?logo=github)](https://github.com/JIaLeChye/wa-scam-bot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Educational%20NonCommercial-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/JIaLeChye/wa-scam-bot?style=social)](https://github.com/JIaLeChye/wa-scam-bot/stargazers)

> 📢 **Updates:** View the full project history in [CHANGELOG.md](CHANGELOG.md).

WA Scam Bot is a moderation tool for WhatsApp groups. It connects to WhatsApp using the `@whiskeysockets/baileys` library and provides a web dashboard to monitor messages. This bot logs messages from unknown senders to a database for review.

## 📋 Current Features

- **Web Dashboard**: View connection status and logs in real-time via a web interface.
- **Authentication**: Connect using QR Code scan or Phone Number Pairing Code.
- **Message Logging**: Automatically saves messages from non-whitelisted numbers to MongoDB.
- **Whitelist System**: Trusted numbers can bypass message logging.
- **Session Management**: Automatically attempts to reconnect if the connection is lost.

## 🗺️ Project Roadmap

- [x] Web Dashboard for logs and pairing.
- [x] QR Code and Pairing Code login support.
- [ ] AI-based Pattern Matching for Scam URLs.
- [ ] Shared Database for Global Blacklisting.
- [ ] New Member Verification (Gatekeeper Mode).

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher

### 1. Clone & Install
```bash
git clone https://github.com/JIaLeChye/wa-scam-bot.git
cd wa-scam-bot
npm install
```

### 2. Launch the Bot
```bash
# Using tsx for fast TypeScript execution
npx tsx src/index.ts
```

### 3. Connect Your Account
Navigate to `http://localhost:3000` and choose your preferred method:

- **Option A**: Request a Pairing Code by entering your phone number (with country code).
- **Option B**: Scan the dynamic QR Code displayed on the dashboard.

## 🧰 Built With

- [Baileys](https://github.com/WhiskeySockets/Baileys) - The industry-standard WhatsApp Web API.
- [Express](https://expressjs.com/) - Robust web framework for the backend API.
- [Socket.IO](https://socket.io/) - Real-time, bidirectional event-based communication.
- [TypeScript](https://www.typescriptlang.org/) - Ensuring type safety and maintainable code.

## ⚠️ Disclaimer

This project is for educational and automated tooling purposes only. Users are responsible for adhering to WhatsApp's Terms of Service. The developers are not responsible for any account bans or misuse of this tool.

---

## 💡 Credits

This project was developed with the assistance of **[GitHub Copilot](https://github.com/features/copilot)**, an AI-powered code completion tool that helped accelerate development, generate boilerplate code, and provide intelligent suggestions throughout the building process.
