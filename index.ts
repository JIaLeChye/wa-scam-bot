import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the dashboard
server.listen(PORT, () => {
    console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
});

let currentState = 'disconnected';
let currentQR = '';
let waSocket: any = null;

io.on('connection', (socket) => {
    console.log('User connected to dashboard');
    socket.emit('status', { state: currentState });
    if (currentQR) {
        QRCode.toDataURL(currentQR, (err, url) => {
            if (!err) socket.emit('qr', url);
        });
    }

    socket.on('request_pairing_code', async (phoneNumber: string) => {
        if (waSocket) {
            try {
                broadcastLog(`Requesting pairing code for ${phoneNumber}...`);
                const code = await waSocket.requestPairingCode(phoneNumber);
                socket.emit('pairing_code', code);
                broadcastLog(`Generated pairing code: ${code}`);
            } catch (err: any) {
                broadcastLog(`Error requesting pairing code: ${err.message}`);
            }
        } else {
            broadcastLog("WhatsApp socket not ready yet.");
        }
    });
});

function broadcastLog(message: string) {
    console.log(message);
    io.emit('log', message);
}

function updateState(state: string) {
    currentState = state;
    io.emit('status', { state });
    if (state === 'connected' || state === 'disconnected' || state === 'connecting') {
        currentQR = ''; // clear QR code when not waiting for scan
    }
}

async function connectToWhatsApp() {
    updateState('connecting');

    // 1. Fetch the absolute latest WhatsApp Web version from Meta
    const { version, isLatest } = await fetchLatestBaileysVersion();
    broadcastLog(`🌍 Connecting to WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

    // 2. Set up the authentication state
    const { state, saveCreds } = await useMultiFileAuthState('session_auth_v2');

    // 3. Initialize the WhatsApp connection with the LATEST version
    const sock = makeWASocket({
        version: version, // This is the magic fix!
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.windows('Chrome'), 
        syncFullHistory: false 
    });
    
    waSocket = sock;

    // 4. Listen for connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQR = qr;
            broadcastLog('📱 Please scan this QR code with your WhatsApp from the web interface or terminal');
            qrcodeTerminal.generate(qr, { small: true });
            
            QRCode.toDataURL(qr, (err, url) => {
                if (!err) io.emit('qr', url);
            });
            updateState('waiting_for_scan');
        }

        if (connection === 'close') {
            const error = lastDisconnect?.error as Error | any;
            const statusCode = error?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            const isConnectionFailure = error?.message === 'Connection Failure' || error?.message === 'stream errored out';
            
            // If logged out or we have a hard connection/session failure, don't just reconnect with bad session
            const shouldReconnect = !isLoggedOut && !isConnectionFailure;

            broadcastLog(`⚠️ Connection closed. Reconnecting: ${shouldReconnect} (Reason: ${error?.message || statusCode})`);
            updateState('disconnected');
            
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 3000); // add small delay
            } else {
                broadcastLog('❌ Session invalid, logged out, or corrupted. Clearing session and restarting...');
                try {
                    fs.rmSync('session_auth_v2', { recursive: true, force: true });
                    broadcastLog('🗑️ Old session data deleted. Generating a new one...');
                } catch (err) {
                    broadcastLog(`Error deleting session: ${err}`);
                }
                setTimeout(connectToWhatsApp, 3000); // start fresh
            }
        } else if (connection === 'open') {
            broadcastLog('✅ Successfully connected to WhatsApp!');
            currentQR = '';
            updateState('connected');
        }
    });

    // 5. Save credentials
    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();