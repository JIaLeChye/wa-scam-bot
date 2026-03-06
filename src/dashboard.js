// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const statusEl = document.getElementById('status');
const qrImg = document.getElementById('qrcode');
const qrMessage = document.getElementById('qr-message');
const qrContainer = document.getElementById('qr-container');
const logsEl = document.getElementById('logs');

const pairingContainer = document.getElementById('pairing-container');
const phoneInput = document.getElementById('phone-number');
const reqBtn = document.getElementById('request-code-btn');
const codeDisplay = document.getElementById('pairing-code-display');
const codeText = document.getElementById('pairing-code');
const modeToggle = document.getElementById('mode-toggle');
const btnPairing = document.getElementById('btn-pairing');
const btnQR = document.getElementById('btn-qr');

// State
let currentMode = 'pairing'; // Mode can be 'pairing' or 'qr'

// Mode Toggle Event Listeners
btnPairing.addEventListener('click', () => {
    currentMode = 'pairing';
    btnPairing.classList.add('active');
    btnPairing.classList.remove('inactive');
    btnQR.classList.add('inactive');
    btnQR.classList.remove('active');
    pairingContainer.style.display = 'block';
    qrContainer.style.display = 'none';
});

btnQR.addEventListener('click', () => {
    currentMode = 'qr';
    btnQR.classList.add('active');
    btnQR.classList.remove('inactive');
    btnPairing.classList.add('inactive');
    btnPairing.classList.remove('active');
    pairingContainer.style.display = 'none';
    qrContainer.style.display = 'block';
});

// Request Pairing Code
reqBtn.addEventListener('click', () => {
    const phone = phoneInput.value.replace(/[^0-9]/g, '');
    if (phone) {
        socket.emit('request_pairing_code', phone);
        reqBtn.disabled = true;
        reqBtn.textContent = "Requesting...";
    }
});

// Socket Event Handlers
socket.on('pairing_code', (code) => {
    codeDisplay.style.display = 'block';
    codeText.textContent = code;
    reqBtn.textContent = "Code Generated";
    addLog(`Pairing code received: ${code}`);
});

socket.on('status', (data) => {
    statusEl.textContent = `Status: ${data.state}`;
    statusEl.className = '';
    
    if (data.state === 'connected') {
        statusEl.classList.add('status-connected');
        modeToggle.style.display = 'none';
        qrImg.style.display = 'none';
        qrMessage.style.display = 'none';
        pairingContainer.style.display = 'none';
        qrContainer.style.display = 'none';
        qrMessage.textContent = 'Successfully connected!';
    } else if (data.state === 'connecting') {
        statusEl.classList.add('status-connecting');
    } else if (data.state === 'waiting_for_scan' || data.state === 'pending') {
        statusEl.classList.add('status-disconnected');
        statusEl.textContent = 'Status: Waiting for Login';
        modeToggle.style.display = 'block';
        if (currentMode === 'pairing') {
            pairingContainer.style.display = 'block';
            qrContainer.style.display = 'none';
        } else {
            pairingContainer.style.display = 'none';
            qrContainer.style.display = 'block';
        }
    } else {
        statusEl.classList.add('status-disconnected');
    }
});

socket.on('qr', (qrDataUrl) => {
    qrMessage.style.display = 'none';
    qrImg.style.display = 'block';
    qrImg.src = qrDataUrl;
    addLog('Please scan the QR code.');
});

socket.on('log', (msg) => {
    addLog(msg);
});

socket.on('connect', () => {
    addLog('Connected to dashboard server');
});

socket.on('disconnect', () => {
    addLog('Disconnected from dashboard server');
    statusEl.textContent = 'Status: Server Offline';
    statusEl.className = 'status-disconnected';
    qrImg.style.display = 'none';
    qrMessage.style.display = 'block';
    qrMessage.textContent = 'Waiting for server...';
});

// Utility Functions
function addLog(msg) {
    const p = document.createElement('div');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logsEl.appendChild(p);
    logsEl.scrollTop = logsEl.scrollHeight;
}
