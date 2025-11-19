const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'wardrobe-data.json');
const OUTFITS_FILE = path.join(__dirname, 'outfits-data.json');

function ensureDataFile() {
    if (fs.existsSync(DATA_FILE)) {
        return;
    }

    const seed = [
        {
            id: Date.now(),
            name: 'White T-shirt',
            season: 'summer',
            occasion: 'casual',
            brand: 'Uniqlo',
            size: 'M',
            material: 'Cotton',
            notes: 'Basic essential',
            image: 'https://placehold.co/320x400?text=White+Tee',
            originalImage: '',
            wearingPhoto: '',
            dateAdded: new Date().toISOString()
        },
        {
            id: Date.now() + 1,
            name: 'Blue Jeans',
            season: 'all',
            occasion: 'casual',
            brand: "Levi's",
            size: '27',
            material: 'Denim',
            notes: 'High-waist straight fit',
            image: 'https://placehold.co/320x400?text=Jeans',
            originalImage: '',
            wearingPhoto: '',
            dateAdded: new Date().toISOString()
        }
    ];

    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
}

function readData() {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getClothes() {
    return readData();
}

function addClothes(item) {
    const data = readData();
    data.unshift(item);
    writeData(data);
    return item;
}

function updateClothes(id, updates) {
    const data = readData();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }

    data[index] = { ...data[index], ...updates, id };
    writeData(data);
    return data[index];
}

function deleteClothes(id) {
    const data = readData();
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
        return false;
    }
    writeData(filtered);
    return true;
}

// Outfits storage functions
function ensureOutfitsFile() {
    if (fs.existsSync(OUTFITS_FILE)) {
        return;
    }
    fs.writeFileSync(OUTFITS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readOutfits() {
    ensureOutfitsFile();
    const raw = fs.readFileSync(OUTFITS_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeOutfits(data) {
    fs.writeFileSync(OUTFITS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getOutfits() {
    return readOutfits();
}

function addOutfit(outfit) {
    const data = readOutfits();
    data.unshift(outfit);
    writeOutfits(data);
    return outfit;
}

function updateOutfit(id, updates) {
    const data = readOutfits();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
        return null;
    }
    data[index] = { ...data[index], ...updates, id };
    writeOutfits(data);
    return data[index];
}

function deleteOutfit(id) {
    const data = readOutfits();
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
        return false;
    }
    writeOutfits(filtered);
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

