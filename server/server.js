const express = require('express');
const cors = require('cors');
const storage = require('./storage');
const users = require('./users');

// 初始化数据库连接（如果可用）
try {
    const db = require('./db');
    db.connectDB().catch(console.error);
} catch (error) {
    console.log('[Server] MongoDB not available, using file-based storage');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/', (req, res) => res.send('API is running'));

async function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.headers['x-auth-token'] ||
                  req.query.token;
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, please log in first.' });
    }
    
    const session = await users.verifyToken(token);
    if (!session) {
        return res.status(401).json({ message: 'Your login has expired. Please log in again.' });
    }
    
    req.userId = session.userId;
    req.username = session.username;
    next();
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password cannot be empty.' });
        }
        
        await users.registerUser(username, password);
        const loginResult = await users.loginUser(username, password);
        
        res.status(201).json(loginResult);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password cannot be empty.' });
        }
        
        const result = await users.loginUser(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.headers['x-auth-token'] ||
                  req.query.token;
    await users.logoutUser(token);
    res.json({ message: 'Logout' });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await users.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/auth/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        
        const isAvailable = await users.isUsernameAvailable(username);
        res.json({ 
            available: isAvailable,
            message: isAvailable ? 'Username is available' : 'Username already exists'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/auth/me', authenticate, async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const updates = {};
        
        if (username !== undefined) {
            updates.username = username;
        }
        if (avatar !== undefined) {
            updates.avatar = avatar;
        }
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        const updatedUser = await users.updateUser(req.userId, updates);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/auth/change-password', authenticate, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required.' });
        }
        
        await users.changePassword(req.userId, oldPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        
        if (!username || !newPassword) {
            return res.status(400).json({ message: 'Username and new password are required.' });
        }
        
        const user = await users.resetPassword(username, newPassword);
        res.json({ 
            message: 'Password reset successfully. Please login with your new password.',
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/clothes', authenticate, (req, res) => {
    try {
        res.json(storage.getClothes(req.userId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch clothes' });
    }
});

app.post('/api/clothes', authenticate, (req, res) => {
    const validationError = validateClothes(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const payload = formatPayload(req.body);
        storage.addClothes(req.userId, payload);
        res.status(201).json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create clothes' });
    }
});

app.put('/api/clothes/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);
    try {
        const existingList = storage.getClothes(req.userId);
        const existing = existingList.find(item => item.id === id);
        if (!existing) {
            return res.status(404).json({ message: 'Not found' });
        }

        const updatedPayload = {
            ...existing,
            ...req.body,
            id,
            dateAdded: existing.dateAdded || new Date().toISOString()
        };

        const result = storage.updateClothes(req.userId, id, updatedPayload);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update clothes' });
    }
});

app.delete('/api/clothes/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);
    try {
        const success = storage.deleteClothes(req.userId, id);
        if (!success) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete clothes' });
    }
});

app.get('/api/outfits', authenticate, (req, res) => {
    try {
        const outfits = storage.getOutfits(req.userId);
        res.json(outfits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch outfits' });
    }
});

app.post('/api/outfits', authenticate, (req, res) => {
    const validationError = validateOutfit(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const payload = formatOutfitPayload(req.body);
        storage.addOutfit(req.userId, payload);
        res.status(201).json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create outfit' });
    }
});

app.put('/api/outfits/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);
    try {
        const existingList = storage.getOutfits(req.userId);
        const existing = existingList.find(item => item.id === id);
        if (!existing) {
            return res.status(404).json({ message: 'Not found' });
        }

        const updatedPayload = {
            ...existing,
            ...req.body,
            id,
            dateCreated: existing.dateCreated || new Date().toISOString()
        };

        const result = storage.updateOutfit(req.userId, id, updatedPayload);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update outfit' });
    }
});

app.delete('/api/outfits/:id', authenticate, (req, res) => {
    const id = Number(req.params.id);
    try {
        const success = storage.deleteOutfit(req.userId, id);
        if (!success) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete outfit' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

function validateClothes(data = {}) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        return 'Name is required';
    }
    if (!data.image || typeof data.image !== 'string') {
        return 'Image is required';
    }
    
    const MAX_BASE64_SIZE = 10 * 1024 * 1024;
    if (data.image.length > MAX_BASE64_SIZE) {
        return 'Image data is too large (maximum 10MB)';
    }
    
    if (data.originalImage && data.originalImage.length > MAX_BASE64_SIZE) {
        return 'Original image data is too large (maximum 10MB)';
    }
    
    if (data.wearingPhoto && data.wearingPhoto.length > MAX_BASE64_SIZE) {
        return 'Wearing photo data is too large (maximum 10MB)';
    }
    
    if (data.image && !data.image.startsWith('data:image/')) {
        return 'Invalid image format';
    }
    
    if (data.name && data.name.length > 200) {
        return 'Name is too long (maximum 200 characters)';
    }
    if (data.brand && data.brand.length > 100) {
        return 'Brand is too long (maximum 100 characters)';
    }
    if (data.size && data.size.length > 50) {
        return 'Size is too long (maximum 50 characters)';
    }
    if (data.material && data.material.length > 100) {
        return 'Material is too long (maximum 100 characters)';
    }
    if (data.notes && data.notes.length > 500) {
        return 'Notes is too long (maximum 500 characters)';
    }
    
    return null;
}

function formatPayload(data) {
    const cleanString = (str, maxLength) => {
        if (typeof str !== 'string') return '';
        return str.trim().substring(0, maxLength);
    };
    
    const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'all'];
    const validOccasions = ['casual', 'date', 'work', 'party', 'formal', 'sport'];
    
    // 处理季节：支持数组或单个值
    let season = 'all';
    if (Array.isArray(data.season)) {
        const validSeasonsArray = data.season.filter(s => validSeasons.includes(s));
        season = validSeasonsArray.length > 0 ? validSeasonsArray : ['all'];
    } else if (typeof data.season === 'string' && validSeasons.includes(data.season)) {
        season = data.season;
    }
    
    // 处理场合：支持数组或单个值
    let occasion = 'casual';
    if (Array.isArray(data.occasion)) {
        const validOccasionsArray = data.occasion.filter(o => validOccasions.includes(o));
        occasion = validOccasionsArray.length > 0 ? validOccasionsArray : ['casual'];
    } else if (typeof data.occasion === 'string' && validOccasions.includes(data.occasion)) {
        occasion = data.occasion;
    }
    
    return {
        id: data.id || Date.now(),
        name: cleanString(data.name, 200) || 'Unnamed Clothes',
        season: season,
        occasion: occasion,
        brand: cleanString(data.brand, 100),
        size: cleanString(data.size, 50),
        material: cleanString(data.material, 100),
        notes: cleanString(data.notes, 500),
        image: typeof data.image === 'string' ? data.image : '',
        originalImage: typeof data.originalImage === 'string' ? data.originalImage : '',
        wearingPhoto: typeof data.wearingPhoto === 'string' ? data.wearingPhoto : '',
        dateAdded: data.dateAdded || new Date().toISOString()
    };
}

function validateOutfit(data = {}) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        return 'Name is required';
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        return 'At least one item is required';
    }
    
    if (data.name && data.name.length > 200) {
        return 'Name is too long (maximum 200 characters)';
    }
    if (data.notes && data.notes.length > 500) {
        return 'Notes is too long (maximum 500 characters)';
    }
    
    if (data.items && Array.isArray(data.items)) {
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            if (!item || typeof item !== 'object') {
                return `Item at index ${i} is invalid`;
            }
            if (!item.id || typeof item.id !== 'number') {
                return `Item at index ${i} must have a valid id`;
            }
        }
    }
    
    return null;
}

function formatOutfitPayload(data) {
    const cleanString = (str, maxLength) => {
        if (typeof str !== 'string') return '';
        return str.trim().substring(0, maxLength);
    };
    
    const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'all'];
    const validOccasions = ['casual', 'date', 'work', 'party', 'formal', 'sport'];
    
    // 处理季节：支持数组或单个值
    let season = 'all';
    if (Array.isArray(data.season)) {
        const validSeasonsArray = data.season.filter(s => validSeasons.includes(s));
        season = validSeasonsArray.length > 0 ? validSeasonsArray : ['all'];
    } else if (typeof data.season === 'string' && validSeasons.includes(data.season)) {
        season = data.season;
    }
    
    // 处理场合：支持数组或单个值
    let occasion = 'casual';
    if (Array.isArray(data.occasion)) {
        const validOccasionsArray = data.occasion.filter(o => validOccasions.includes(o));
        occasion = validOccasionsArray.length > 0 ? validOccasionsArray : ['casual'];
    } else if (typeof data.occasion === 'string' && validOccasions.includes(data.occasion)) {
        occasion = data.occasion;
    }
    
    const cleanItems = (items) => {
        if (!Array.isArray(items)) return [];
        return items
            .filter(item => item && typeof item === 'object' && item.id)
            .map(item => ({
                id: typeof item.id === 'number' ? item.id : 0,
                name: cleanString(item.name, 200) || 'Unknown',
                image: typeof item.image === 'string' ? item.image.substring(0, 10000000) : ''
            }));
    };
    
    return {
        id: data.id || Date.now(),
        name: cleanString(data.name, 200) || 'Unnamed Outfit',
        season: season,
        occasion: occasion,
        notes: cleanString(data.notes, 500),
        items: cleanItems(data.items),
        dateCreated: data.dateCreated || new Date().toISOString()
    };
}
