import mongoose, {connect, Mongoose} from 'mongoose'; // MongoDB for logging and analytics 
import dotenv from 'dotenv'; 
import { fileURLToPath } from 'url'; // Get __dirname in ES modules
import path from 'path'; // Handle file paths

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env'); 
dotenv.config({path : envPath}); 


console.log(process.env ? 'Environment variables loaded successfully' : 'Failed to load environment variables');

const MongoDB_URI = process.env.MongoDB_URI;

const connectDB = async() => {
    try {
        await mongoose.connect(MongoDB_URI as string);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if DB connection fails
    }
};


const messageSchema = new mongoose.Schema({
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model('Message', messageSchema); 

const WhitelistSchema = new mongoose.Schema({
    phoneNumber: {type: String, required: true, unique: true},
    note: String,
    addedAt: { type: Date, default: Date.now }
});

const WhitelistModel = mongoose.model('Whitelist', WhitelistSchema); 

connectDB(); // Connect to MongoDB when this module is imported

export { connectDB, MessageModel, WhitelistModel };

