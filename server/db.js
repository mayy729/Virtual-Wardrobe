const mongoose = require('mongoose');

// 用户模型
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 20
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 会话模型
const sessionSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// 自动清理过期会话（通过索引）
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 衣服模型
const clothesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['clothes', 'accessories'],
        default: 'clothes'
    },
    image: {
        type: String,
        required: true
    },
    season: {
        type: [String],
        default: ['all']
    },
    occasion: {
        type: [String],
        default: ['casual']
    },
    brand: String,
    color: String,
    category: String,
    notes: String,
    wearingPhoto: String,
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 复合索引：userId + id 确保每个用户的衣服 ID 唯一
clothesSchema.index({ userId: 1, id: 1 }, { unique: true });

// 搭配模型
const outfitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    season: {
        type: [String],
        default: ['all']
    },
    occasion: {
        type: [String],
        default: ['casual']
    },
    notes: String,
    items: {
        type: [{
            id: Number,
            name: String,
            image: String
        }],
        required: true
    },
    image: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 复合索引：userId + id 确保每个用户的搭配 ID 唯一
outfitSchema.index({ userId: 1, id: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const Clothes = mongoose.models.Clothes || mongoose.model('Clothes', clothesSchema);
const Outfit = mongoose.models.Outfit || mongoose.model('Outfit', outfitSchema);

// 连接数据库
let isConnected = false;
let connectionAttempted = false;

async function connectDB() {
    if (isConnected) {
        console.log('[DB] Already connected to MongoDB');
        return true;
    }
    
    if (connectionAttempted) {
        console.log('[DB] Connection already attempted, skipping...');
        return false;
    }
    
    connectionAttempted = true;

    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.warn('[DB] MONGODB_URI not set, using file-based storage');
            return false;
        }

        console.log('[DB] Attempting to connect to MongoDB...');
        console.log('[DB] MongoDB URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // 隐藏密码
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10秒超时
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log('[DB] ✅ Connected to MongoDB successfully!');
        return true;
    } catch (error) {
        console.error('[DB] ❌ MongoDB connection error:', error.message);
        console.error('[DB] Error details:', error);
        console.warn('[DB] Falling back to file-based storage');
        return false;
    }
}

// 初始化数据库连接（延迟连接，避免阻塞启动）
setTimeout(() => {
    connectDB().catch(console.error);
}, 1000);

module.exports = {
    connectDB,
    User,
    Session,
    Clothes,
    Outfit,
    isMongoConnected: () => isConnected
};

