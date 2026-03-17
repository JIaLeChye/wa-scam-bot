import mongoose from 'mongoose'; // MongoDB for logging and analytics
import dotenv from 'dotenv'; 
import { fileURLToPath } from 'url'; // Get __dirname in ES modules
import path from 'path'; // Handle file paths

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env'); 
dotenv.config({path : envPath}); 


console.log(process.env ? 'Environment variables loaded successfully' : 'Failed to load environment variables');

const MongoDB_URI = process.env.MongoDB_URI || process.env.MONGODB_URI;
let connectPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (connectPromise) {
        return connectPromise;
    }

    if (!MongoDB_URI) {
        throw new Error('MongoDB_URI is not set in environment variables');
    }

    connectPromise = mongoose
        .connect(MongoDB_URI, {
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        })
        .then((conn) => {
            console.log('Connected to MongoDB');
            return conn;
        })
        .catch((err) => {
            connectPromise = null;
            console.error('MongoDB connection error:', err);
            throw err;
        });

    return connectPromise;
};


const messageSchema = new mongoose.Schema(
    {
        sender: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    },
    { versionKey: false }
);
messageSchema.index({ sender: 1, timestamp: -1 });

const MessageModel = mongoose.model('Message', messageSchema); 

const WhitelistSchema = new mongoose.Schema(
    {
        phoneNumber: { type: String, required: true, unique: true },
        note: String,
        addedAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
);
WhitelistSchema.index({ phoneNumber: 1 });

const WhitelistModel = mongoose.model('Whitelist', WhitelistSchema); 

const scamLogSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },
        content: { type: String, required: true },
        matchedKeywords: { type: [String], default: [] },
        detectedUrls: { type: [String], default: [] },
        riskScore: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
);
scamLogSchema.index({ createdAt: -1 });
scamLogSchema.index({ sender: 1, createdAt: -1 });

const ScamLogModel = mongoose.model('ScamLog', scamLogSchema);

const scamKeywordSchema = new mongoose.Schema(
    {
        keyword: {
            type: String,
            required: true,
            unique: true,
            set: (value: string) => value.toLowerCase().trim()
        },
        isActive: { type: Boolean, default: true },
        matchCount: { type: Number, default: 0 },
        lastMatchedAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
);
scamKeywordSchema.index({ isActive: 1, keyword: 1 });

const ScamKeywordModel = mongoose.model('ScamKeyword', scamKeywordSchema);

const scamUrlSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true,
            set: (value: string) => value.toLowerCase().trim()
        },
        firstSeenAt: { type: Date, default: Date.now },
        lastSeenAt: { type: Date, default: Date.now },
        hitCount: { type: Number, default: 1 },
        senderSamples: { type: [String], default: [] },
        lastMessageSample: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
);
scamUrlSchema.index({ lastSeenAt: -1 });

const ScamUrlModel = mongoose.model('ScamUrl', scamUrlSchema);

export { connectDB, MessageModel, WhitelistModel, ScamLogModel, ScamKeywordModel, ScamUrlModel };

