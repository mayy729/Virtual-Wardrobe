const express = require('express');
const cors = require('cors');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/', (req, res) => res.send('API is running'));

app.get('/api/clothes', (req, res) => {
    try {
        res.json(storage.getClothes());
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch clothes' });
    }
});

app.post('/api/clothes', (req, res) => {
    const validationError = validateClothes(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const payload = formatPayload(req.body);
        storage.addClothes(payload);
        res.status(201).json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create clothes' });
    }
});

app.put('/api/clothes/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const existingList = storage.getClothes();
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

        const result = storage.updateClothes(id, updatedPayload);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update clothes' });
    }
});

app.delete('/api/clothes/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const success = storage.deleteClothes(id);
        if (!success) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete clothes' });
    }
});

app.get('/api/outfits', (req, res) => {
    try {
        const outfits = storage.getOutfits();
        res.json(outfits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch outfits' });
    }
});

app.post('/api/outfits', (req, res) => {
    const validationError = validateOutfit(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const payload = formatOutfitPayload(req.body);
        storage.addOutfit(payload);
        res.status(201).json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create outfit' });
    }
});

app.put('/api/outfits/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const existingList = storage.getOutfits();
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

        const result = storage.updateOutfit(id, updatedPayload);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update outfit' });
    }
});

app.delete('/api/outfits/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const success = storage.deleteOutfit(id);
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
    
    return {
        id: data.id || Date.now(),
        name: cleanString(data.name, 200) || 'Unnamed Clothes',
        season: validSeasons.includes(data.season) ? data.season : 'all',
        occasion: validOccasions.includes(data.occasion) ? data.occasion : 'casual',
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
        season: validSeasons.includes(data.season) ? data.season : 'all',
        occasion: validOccasions.includes(data.occasion) ? data.occasion : 'casual',
        notes: cleanString(data.notes, 500),
        items: cleanItems(data.items),
        dateCreated: data.dateCreated || new Date().toISOString()
    };
}
