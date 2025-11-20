const fs = require('fs');
const path = require('path');

// 多用户数据存储：每个用户有独立的数据文件
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

function getClothes(userId) {
    return readData(userId, 'wardrobe');
}

function addClothes(userId, item) {
    const data = readData(userId, 'wardrobe');
    data.unshift(item);
    writeData(userId, 'wardrobe', data);
    return item;
}

function updateClothes(userId, id, updates) {
    const data = readData(userId, 'wardrobe');
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }

    data[index] = { ...data[index], ...updates, id };
    writeData(userId, 'wardrobe', data);
    return data[index];
}

function deleteClothes(userId, id) {
    const data = readData(userId, 'wardrobe');
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
        return false;
    }
    writeData(userId, 'wardrobe', filtered);
    return true;
}

// Outfits storage functions
function getOutfits(userId) {
    return readData(userId, 'outfits');
}

function addOutfit(userId, outfit) {
    const data = readData(userId, 'outfits');
    data.unshift(outfit);
    writeData(userId, 'outfits', data);
    return outfit;
}

function updateOutfit(userId, id, updates) {
    const data = readData(userId, 'outfits');
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }
    data[index] = { ...data[index], ...updates, id };
    writeData(userId, 'outfits', data);
    return data[index];
}

function deleteOutfit(userId, id) {
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

