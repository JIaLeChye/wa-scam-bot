import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'; // The WA socket library
import QRCode from 'qrcode';
import fs from 'fs'; // File system for session management
import { MessageModel, WhitelistModel } from './db.js';
import { detectAndRecordScam } from './chatBot.js';

let waSocket: any = null;
let currentState = 'disconnected';
let currentQR = ''; 

async function startWhatsappBot(io: any) {

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

    io.on('connection',(socket: any) =>{
        socket.emit('status', { state: currentState });
        if (currentQR) {
            QRCode.toDataURL(currentQR, (err, url) => {
                if (!err) socket.emit('qr', url);
            });
        }



    socket.on("request_pairing_code", async(phoneNumber: string) => {
        if(waSocket){

            try{
                broadcastLog(`🔍 Requesting Pairing Code for ${phoneNumber}`);
                const code = await waSocket.requestPairingCode(phoneNumber);
                socket.emit('pairing_code', code );  
                broadcastLog(`✅ Pairing code for ${phoneNumber} sent to dashboard`);
            

            } catch(err:any){
                broadcastLog(`Error requesting pairing code for ${phoneNumber}: ${err.message || err}`);
            }
        }
        else {
            broadcastLog('⚠️ Cannot request pairing code: WhatsApp socket not initialized');
        }

    }); 
    });

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

            // Handle QR code generation for new sessions
            if (qr) {
                currentQR = qr;
                broadcastLog('📱 Please scan this QR code with your WhatsApp from the web interface ');
                // qrcodeTerminal.generate(qr, { small: true });
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

        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if(!msg) return; // safety check

            if (!msg.key.fromMe && m.type === 'notify') {
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                const sender = msg.key.remoteJid; 

                if (text && sender) {
                    const isWhitelisted = await WhitelistModel.exists({ phoneNumber: sender });
                    if (!isWhitelisted) {

                        broadcastLog(`📩 New message from ${sender}: ${text}`);
                        broadcastLog(`🔍 ${sender} is not whitelisted`);
                        try{
                            await MessageModel.create({ sender, content: text });
                            broadcastLog('💾 Message saved to database');

                            const scamResult = await detectAndRecordScam(sender, text);
                            if (scamResult.isSuspected) {
                                broadcastLog(`🚨 Scam suspected from ${sender}. URLs: ${scamResult.detectedUrls.join(', ') || 'none'}`);
                                io.emit('scam_alert', {
                                    sender,
                                    content: text,
                                    riskScore: scamResult.riskScore,
                                    matchedKeywords: scamResult.matchedKeywords,
                                    detectedUrls: scamResult.detectedUrls
                                });
                            }

                        } catch (dberr) {
                            broadcastLog(`Error saving message to database: ${dberr}`);
                        }
                    }
                        else {
                        broadcastLog(`✅ Message from ${sender} is whitelisted : ${text}`); 
                        return; 
                        }
                }
            }
        });

        // 5. Save credentials
        sock.ev.on('creds.update', saveCreds);
    }

    connectToWhatsApp(); // Start the connection process    
 }


 export { startWhatsappBot, waSocket };