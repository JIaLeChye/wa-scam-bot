import express from 'express'; // Web server for dashboard
import { createServer } from 'http'; // Create HTTP server for Socket.IO  
import { Server } from 'socket.io'; // Real-time communication with dashboard 
import path from 'path'; // Handle file paths
import { fileURLToPath } from 'url'; // Get __dirname in ES modules
import 'dotenv/config'; // Load environment variables from .env file 
import { connectDB } from './db.js'; // MongoDB connection
import { startWhatsappBot } from './bot.js'; // WhatsApp bot logic



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT) || 3000;
const webUiPath = path.join(__dirname, '../WebUI');
const dbErrorPagePath = path.join(webUiPath, 'db-error.html');
let isDbConnected = false;

app.use((req, res, next) => {
    if (isDbConnected) {
        next();
        return;
    }

    if (req.method === 'GET' && !req.path.startsWith('/socket.io')) {
        res.status(503).sendFile(dbErrorPagePath);
        return;
    }

    res.status(503).json({ error: 'Database unavailable' });
});

// Serve static files from WebUI directory
app.use(express.static(webUiPath));

app.get('/WebUI', (req, res) => {
    res.sendFile(path.join(webUiPath, 'index.html'));
});

// Serve the dashboard
server.listen(PORT, () => {
    console.log(`🌐 Dashboard running...`);
    console.log(`📊 Access the dashboard at http://localhost:${PORT}`);
});

async function initializeServices() {
    try {
        await connectDB();
        isDbConnected = true;
        startWhatsappBot(io); // Start only when DB is ready
    } catch (error: any) {
        console.error(`❌ Database unavailable at startup: ${error?.message || error}`);
        console.error(`⚠️ Serving maintenance page until database is back online.`);
    }
}

initializeServices();


io.on('connection', (socket) => {
    console.log('User connected to dashboard');
});