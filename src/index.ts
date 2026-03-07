import express from 'express'; // Web server for dashboard
import { createServer } from 'http'; // Create HTTP server for Socket.IO  
import { Server } from 'socket.io'; // Real-time communication with dashboard 
import path from 'path'; // Handle file paths
import { fileURLToPath } from 'url'; // Get __dirname in ES modules
import 'dotenv/config'; // Load environment variables from .env file 
import { connectDB, MessageModel, WhitelistModel } from './db.js'; // MongoDB connection and models
import { startWhatsappBot, waSocket } from './bot.js'; // WhatsApp bot logic



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Serve static files from src directory
app.use(express.static(path.join(__dirname, '../WebUI')));

app.get('/WebUI', (req, res) => {
    res.sendFile(path.join(__dirname, '../WebUI/index.html'));
});

// Serve the dashboard
server.listen(PORT, () => {
    console.log(`🌐 Dashboard running...`);
    console.log(`📊 Access the dashboard at http://localhost:${PORT}`);
});


connectDB(); // Connect to MongoDB before starting the WhatsApp connection


io.on('connection', (socket) => {
    console.log('User connected to dashboard');
});

startWhatsappBot(io); // Start the WhatsApp bot and pass the Socket.IO instance for real-time updates