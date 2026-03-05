# 🛡️ WA Scam Bot

![GitHub package.json version](https://img.shields.io/github/package-json/v/JIaLeChye/wa-scam-bot?color=blue)
![GitHub stars](https://img.shields.io/github/stars/JIaLeChye/wa-scam-bot?style=social)
![GitHub issues](https://img.shields.io/github/issues/JIaLeChye/wa-scam-bot)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20.x+-green?logo=node.js)

WA Scam Bot is a high-performance automated moderation tool designed to protect WhatsApp communities. By integrating the `@whiskeysockets/baileys` library with a real-time web dashboard, it proactively identifies, flags, and removes malicious scam links to keep your groups safe.

## 🗺️ Project Roadmap

Our mission is to create a "set-and-forget" security layer for WhatsApp group admins.

- [x] Real-time Web Dashboard: Monitor logs and status via a browser.
- [x] Hybrid Authentication: Support for both QR Scanning and 8-digit Pairing Codes.
- [ ] AI Scam Detection: (In Progress) Using pattern matching to identify phishing URLs.
- [ ] Global Blacklist: Integration with a shared database of reported scammer numbers.
- [ ] Gatekeeper Mode: Mandatory "Human Verification" for all new group members.

## ✨ Key Features

- **Zero-Crash Recovery**: Automatically handles session corruption and re-authentication without manual intervention.
- **Admin Automation**: Capability to instantly kick bad actors and delete offending messages.
- **Cross-Platform Dashboard**: Built with Socket.IO for lightning-fast, no-refresh updates.
- **Pairing Code Support**: Link your bot using just a phone number—perfect for remote server deployments where scanning a QR is difficult.

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
npx tsx index.ts
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

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## ⚠️ Disclaimer

This project is for educational and automated tooling purposes only. Users are responsible for adhering to WhatsApp's Terms of Service. The developers are not responsible for any account bans or misuse of this tool.

---

## 💡 Credits

This project was developed with the assistance of **[GitHub Copilot](https://github.com/features/copilot)**, an AI-powered code completion tool that helped accelerate development, generate boilerplate code, and provide intelligent suggestions throughout the building process.
