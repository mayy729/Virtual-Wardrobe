const fs = require('fs');
const path = require('path');

let db = null;

// 检查是否可以使用 MongoDB
function shouldUseMongo() {
    try {
        if (!db) {
            db = require('./db');
        }
        return db.isMongoConnected();
    } catch (error) {
        return false;
    }
}

// 初始化：尝试加载 MongoDB 模块
try {
    db = require('./db');
    console.log('[Storage] MongoDB module loaded, will use MongoDB when connected');
} catch (error) {
    console.log('[Storage] MongoDB not available, using file-based storage');
}

// ========== 文件存储（回退方案） ==========
function getUserDataFile(userId, type) {
    const dataDir = path.join(__dirname, 'user-data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, `user-${userId}-${type}.json`);
}

function getDataFile(userId, type) {
    return getUserDataFile(userId, type);
}

function ensureDataFile(userId, type) {
    const file = getDataFile(userId, type);
    if (fs.existsSync(file)) {
        return;
    }
    fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf-8');
}

function readData(userId, type) {
    ensureDataFile(userId, type);
    const file = getDataFile(userId, type);
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
}

function writeData(userId, type, data) {
    const file = getDataFile(userId, type);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ========== Clothes 存储函数 ==========
async function getClothes(userId) {
    if (shouldUseMongo() && db && db.Clothes) {
        try {
            console.log('[Storage] Loading clothes from MongoDB for user:', userId);
            const items = await db.Clothes.find({ userId }).sort({ dateAdded: -1 }).lean();
            console.log('[Storage] ✅ Loaded', items.length, 'items from MongoDB');
            // 转换 MongoDB 文档为普通对象，移除 _id 和 __v
            return items.map(item => {
                const { _id, __v, ...rest } = item;
                return rest;
            });
        } catch (error) {
            console.error('[Storage] ❌ MongoDB getClothes error:', error);
            console.log('[Storage] Falling back to file storage');
            // 回退到文件存储
            return readData(userId, 'wardrobe');
        }
    }
    console.log('[Storage] Loading clothes from file storage (MongoDB not connected)');
    return readData(userId, 'wardrobe');
}

async function addClothes(userId, item) {
    if (shouldUseMongo() && db && db.Clothes) {
        try {
            console.log('[Storage] Saving clothes to MongoDB for user:', userId);
            const clothesDoc = new db.Clothes({
                ...item,
                userId
            });
            await clothesDoc.save();
            const { _id, __v, ...rest } = clothesDoc.toObject();
            console.log('[Storage] ✅ Clothes saved to MongoDB successfully');
            return rest;
        } catch (error) {
            console.error('[Storage] ❌ MongoDB addClothes error:', error);
            console.log('[Storage] Falling back to file storage');
            // 回退到文件存储
            const data = readData(userId, 'wardrobe');
            data.unshift(item);
            writeData(userId, 'wardrobe', data);
            return item;
        }
    }
    console.log('[Storage] Using file storage for clothes (MongoDB not connected)');
    const data = readData(userId, 'wardrobe');
    data.unshift(item);
    writeData(userId, 'wardrobe', data);
    return item;
}

async function updateClothes(userId, id, updates) {
    if (shouldUseMongo() && db && db.Clothes) {
        try {
            const result = await db.Clothes.findOneAndUpdate(
                { userId, id },
                { $set: { ...updates, id } },
                { new: true, lean: true }
            );
            if (!result) {
                return null;
            }
            const { _id, __v, ...rest } = result;
            return rest;
        } catch (error) {
            console.error('[Storage] MongoDB updateClothes error:', error);
            // 回退到文件存储
            const data = readData(userId, 'wardrobe');
            const index = data.findIndex(item => item.id === id);
            if (index === -1) {
                return null;
            }
            data[index] = { ...data[index], ...updates, id };
            writeData(userId, 'wardrobe', data);
            return data[index];
        }
    }
    const data = readData(userId, 'wardrobe');
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }
    data[index] = { ...data[index], ...updates, id };
    writeData(userId, 'wardrobe', data);
    return data[index];
}

async function deleteClothes(userId, id) {
    if (shouldUseMongo() && db && db.Clothes) {
        try {
            const result = await db.Clothes.deleteOne({ userId, id });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('[Storage] MongoDB deleteClothes error:', error);
            // 回退到文件存储
            const data = readData(userId, 'wardrobe');
            const filtered = data.filter(item => item.id !== id);
            if (filtered.length === data.length) {
                return false;
            }
            writeData(userId, 'wardrobe', filtered);
            return true;
        }
    }
    const data = readData(userId, 'wardrobe');
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
        return false;
    }
    writeData(userId, 'wardrobe', filtered);
    return true;
}

// ========== Outfits 存储函数 ==========
async function getOutfits(userId) {
    if (shouldUseMongo() && db && db.Outfit) {
        try {
            console.log('[Storage] Loading outfits from MongoDB for user:', userId);
            const items = await db.Outfit.find({ userId }).sort({ dateAdded: -1 }).lean();
            console.log('[Storage] ✅ Loaded', items.length, 'outfits from MongoDB');
            return items.map(item => {
                const { _id, __v, ...rest } = item;
                return rest;
            });
        } catch (error) {
            console.error('[Storage] ❌ MongoDB getOutfits error:', error);
            console.log('[Storage] Falling back to file storage');
            return readData(userId, 'outfits');
        }
    }
    console.log('[Storage] Loading outfits from file storage (MongoDB not connected)');
    return readData(userId, 'outfits');
}

async function addOutfit(userId, outfit) {
    if (shouldUseMongo() && db && db.Outfit) {
        try {
            console.log('[Storage] Saving outfit to MongoDB for user:', userId);
            const outfitDoc = new db.Outfit({
                ...outfit,
                userId
            });
            await outfitDoc.save();
            const { _id, __v, ...rest } = outfitDoc.toObject();
            console.log('[Storage] ✅ Outfit saved to MongoDB successfully');
            return rest;
        } catch (error) {
            console.error('[Storage] ❌ MongoDB addOutfit error:', error);
            console.log('[Storage] Falling back to file storage');
            const data = readData(userId, 'outfits');
            data.unshift(outfit);
            writeData(userId, 'outfits', data);
            return outfit;
        }
    }
    console.log('[Storage] Using file storage for outfit (MongoDB not connected)');
    const data = readData(userId, 'outfits');
    data.unshift(outfit);
    writeData(userId, 'outfits', data);
    return outfit;
}

async function updateOutfit(userId, id, updates) {
    if (shouldUseMongo() && db && db.Outfit) {
        try {
            const result = await db.Outfit.findOneAndUpdate(
                { userId, id },
                { $set: { ...updates, id } },
                { new: true, lean: true }
            );
            if (!result) {
                return null;
            }
            const { _id, __v, ...rest } = result;
            return rest;
        } catch (error) {
            console.error('[Storage] MongoDB updateOutfit error:', error);
            const data = readData(userId, 'outfits');
            const index = data.findIndex(item => item.id === id);
            if (index === -1) {
                return null;
            }
            data[index] = { ...data[index], ...updates, id };
            writeData(userId, 'outfits', data);
            return data[index];
        }
    }
    const data = readData(userId, 'outfits');
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }
    data[index] = { ...data[index], ...updates, id };
    writeData(userId, 'outfits', data);
    return data[index];
}

async function deleteOutfit(userId, id) {
    if (shouldUseMongo() && db && db.Outfit) {
        try {
            const result = await db.Outfit.deleteOne({ userId, id });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('[Storage] MongoDB deleteOutfit error:', error);
            const data = readData(userId, 'outfits');
            const filtered = data.filter(item => item.id !== id);
            if (filtered.length === data.length) {
                return false;
            }
            writeData(userId, 'outfits', filtered);
            return true;
        }
    }
    const data = readData(userId, 'outfits');
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
        return false;
    }
    writeData(userId, 'outfits', filtered);
    return true;
}

module.exports = {
    getClothes,
    addClothes,
    updateClothes,
    deleteClothes,
    getOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit
};

