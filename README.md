# WA Scam Bot

A Node.js WhatsApp bot built using the `@whiskeysockets/baileys` library with an integrated web dashboard, specifically designed to protect WhatsApp groups by detecting and removing scam links automatically.

## Project Description & Roadmap

The primary purpose of this project is to filter spam and malicious activity within WhatsApp groups through automated moderation. 
Planned features include:
- **Scam Link Detection**: Automatically detects and deletes messages containing known scam links posted in groups.
- **Member Moderation**: The bot will have admin permissions to kick members who violate the anti-scam rules.
- **Human Verification Framework**: A mechanism applied to new users joining the group to verify if they are human or bots.
- **Scammer Database**: An ongoing integration of a blacklist database of identified scam phone numbers to proactively block bad actors.

## Features

- **Web Dashboard**: Monitor the bot's status and logs in real-time right from your browser.
- **Multiple Login Methods**: 
  - Scan dynamically generated QR codes.
  - Or request an 8-digit **Pairing Code** via your phone number for seamless linking directly inside the WhatsApp app.
- **Auto-Recovery**: Built-in mechanisms to automatically detect connectivity and authentication failures. It intelligently clears corrupted sessions and requests a fresh log in without permanently hard-crashing.

## Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Run the bot:**
   ```bash
   npx tsx index.ts
   ```

3. **Access the Web Dashboard:**
   Open a web browser and navigate to:
   ```
   http://localhost:3000
   ```
   
4. **Log In:**
   - **Phone Number (Pairing Code)**: Select "Use Phone Number", enter your number with the country code (e.g. `1234567890`), click "Get Pairing Code", and enter the generated 8-character string on your phone when prompted by WhatsApp.
   - **QR Code**: Select "Use QR Code" and scan the image with the "Linked Devices" feature inside WhatsApp.

## Built With
- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) – WhatsApp Web API
- [Express](https://expressjs.com/) & [Socket.IO](https://socket.io/) – Web server and real-time frontend dashboard communication 
- TypeScript

## Disclaimer
Note: Use this responsibly and adhere to WhatsApp's Terms of Service. It's meant for educational or automated tooling purposes.
