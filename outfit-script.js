let availableItems = [];
let selectedItems = [];

const selectableWardrobe = document.getElementById('selectable-wardrobe');
const outfitArea = document.getElementById('outfit-area');
const saveOutfitBtn = document.getElementById('save-outfit-btn');
const clearOutfitBtn = document.getElementById('clear-outfit');
const saveOutfitModal = document.getElementById('save-outfit-modal');
const saveOutfitForm = document.getElementById('save-outfit-form');
const cancelSaveOutfit = document.getElementById('cancel-save-outfit');
const closeModal = document.querySelector('.close-modal');
const outfitFilterSeason = document.getElementById('outfit-filter-season');
const outfitFilterOccasion = document.getElementById('outfit-filter-occasion');
const PLACEHOLDER_IMAGE = './hello-kitty-bg.jpg';

async function loadWardrobeForOutfit() {
    Utils.renderLoading(selectableWardrobe, 'Loading clothes...');
    try {
        const wardrobe = await WardrobeAPI.listClothes();
        availableItems = wardrobe;
        filterAndDisplayItems();
    } catch (error) {
        console.error('Failed to load wardrobe for outfit:', error);
        Utils.renderError(selectableWardrobe, 'Unable to get clothes, please check the backend service.');
        Utils.showNotification('Unable to load wardrobe data, cannot create outfit temporarily.', 'error');
    }
}

function filterAndDisplayItems() {
    const seasonFilter = outfitFilterSeason.value;
    const occasionFilter = outfitFilterOccasion.value;
    
    let filtered = availableItems;
    
    if (seasonFilter) {
        filtered = filtered.filter(item => 
            item.season === seasonFilter || item.season === 'all'
        );
    }
    
    if (occasionFilter) {
        filtered = filtered.filter(item => item.occasion === occasionFilter);
    }
    
    displaySelectableItems(filtered);
}

function displaySelectableItems(items) {
    selectableWardrobe.innerHTML = '';
    
    if (items.length === 0) {
        selectableWardrobe.innerHTML = '<p class="empty-message">No clothing matching the criteria was found.</p>';
        return;
    }
    
    items.forEach(item => {
        const imageSrc = item.image || item.originalImage || PLACEHOLDER_IMAGE;
        const itemCard = document.createElement('div');
        itemCard.className = 'selectable-item-card';
        itemCard.dataset.id = item.id;
        itemCard.draggable = true;
        
        itemCard.innerHTML = `
            <img src="${imageSrc}" alt="${item.name}">
            <div class="item-card-info">
                <p>${item.name}</p>
            </div>
        `;
        
        itemCard.addEventListener('click', () => {
            addItemToOutfit(item);
        });
        
        itemCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('itemId', item.id.toString());
            itemCard.classList.add('dragging');
        });
        
        itemCard.addEventListener('dragend', () => {
            itemCard.classList.remove('dragging');
        });
        
        selectableWardrobe.appendChild(itemCard);
    });
}

function addItemToOutfit(item) {
    if (selectedItems.find(i => i.id === item.id)) {
        Utils.showNotification('This clothing is already in the current outfit!', 'info');
        return;
    }
    
    selectedItems.push(item);
    updateOutfitArea();
}

function updateOutfitArea() {
    outfitArea.innerHTML = '';
    
    if (selectedItems.length === 0) {
        outfitArea.innerHTML = '<p class="drop-hint">Drag clothes here to create an outfit, or click on the clothes cards below.</p>';
        return;
    }
    
    selectedItems.forEach((item, index) => {
        const outfitItem = document.createElement('div');
        outfitItem.className = 'outfit-item';
        outfitItem.dataset.id = item.id;
        
        outfitItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="outfit-item-info">
                <p>${item.name}</p>
            </div>
            <button class="btn-remove-from-outfit" data-index="${index}">✕</button>
        `;
        
        outfitArea.appendChild(outfitItem);
    });
    
    outfitArea.querySelectorAll('.btn-remove-from-outfit').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            selectedItems.splice(index, 1);
            updateOutfitArea();
        });
    });
}

outfitArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    outfitArea.classList.add('drag-over');
});

outfitArea.addEventListener('dragleave', () => {
    outfitArea.classList.remove('drag-over');
});

outfitArea.addEventListener('drop', (e) => {
    e.preventDefault();
    outfitArea.classList.remove('drag-over');
    
    const itemId = parseInt(e.dataTransfer.getData('itemId'));
    const item = availableItems.find(i => i.id === itemId);
    
    if (item) {
        addItemToOutfit(item);
    }
});

clearOutfitBtn.addEventListener('click', () => {
    if (selectedItems.length === 0) return;
    
    const confirmed = Utils.confirm ? Utils.confirm('Are you sure you want to clear the current outfit?') : confirm('Are you sure you want to clear the current outfit?');
    if (confirmed) {
        selectedItems = [];
        updateOutfitArea();
    }
});

saveOutfitBtn.addEventListener('click', () => {
    if (selectedItems.length === 0) {
        Utils.showNotification('Please select clothes before saving the outfit!', 'info');
        return;
    }
    
    if (selectedItems.length > 0) {
        const firstItem = selectedItems[0];
        if (firstItem.season) {
            document.getElementById('outfit-season').value = firstItem.season;
        }
        if (firstItem.occasion) {
            document.getElementById('outfit-occasion').value = firstItem.occasion;
        }
    }
    
    saveOutfitModal.style.display = 'block';
});

saveOutfitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = saveOutfitForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    const outfitData = {
        name: document.getElementById('outfit-name').value,
        season: document.getElementById('outfit-season').value,
        occasion: document.getElementById('outfit-occasion').value,
        notes: document.getElementById('outfit-notes').value || '',
        items: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image || item.originalImage || ''
        }))
    };
    
    try {
        await WardrobeAPI.createOutfit(outfitData);
        Utils.showNotification('Outfit saved to server!', 'success');
        
        selectedItems = [];
        updateOutfitArea();
        saveOutfitForm.reset();
        saveOutfitModal.style.display = 'none';
    } catch (error) {
        console.error('Failed to save outfit:', error);
        Utils.showNotification('Save failed, please try again later.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

closeModal.addEventListener('click', () => {
    saveOutfitModal.style.display = 'none';
});

cancelSaveOutfit.addEventListener('click', () => {
    saveOutfitModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === saveOutfitModal) {
        saveOutfitModal.style.display = 'none';
    }
});

outfitFilterSeason.addEventListener('change', filterAndDisplayItems);
outfitFilterOccasion.addEventListener('change', filterAndDisplayItems);

window.addEventListener('DOMContentLoaded', loadWardrobeForOutfit);
