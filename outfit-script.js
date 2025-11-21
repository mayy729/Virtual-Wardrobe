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
const outfitFilterType = document.getElementById('outfit-filter-type');
const outfitFilterBrand = document.getElementById('outfit-filter-brand');
const outfitFilterSize = document.getElementById('outfit-filter-size');
const outfitFilterMaterial = document.getElementById('outfit-filter-material');
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
    const typeFilter = outfitFilterType.value;
    
    // 收集选中的季节（多选下拉菜单）
    const outfitFilterSeason = document.getElementById('outfit-filter-season');
    const selectedSeasons = Array.from(outfitFilterSeason.selectedOptions).map(opt => opt.value);
    
    // 收集选中的场合（多选下拉菜单）
    const outfitFilterOccasion = document.getElementById('outfit-filter-occasion');
    const selectedOccasions = Array.from(outfitFilterOccasion.selectedOptions).map(opt => opt.value);
    
    const brandFilter = (outfitFilterBrand.value || '').toLowerCase();
    const sizeFilter = (outfitFilterSize.value || '').toLowerCase();
    const materialFilter = (outfitFilterMaterial.value || '').toLowerCase();
    
    let filtered = availableItems;
    
    // 匹配类型
    if (typeFilter) {
        filtered = filtered.filter(item => (item.type || 'clothes') === typeFilter);
    }
    
    // 匹配季节（支持数组或单个值，多选过滤）
    if (selectedSeasons.length > 0) {
        filtered = filtered.filter(item => {
            const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
            return selectedSeasons.some(selectedSeason => 
                itemSeasons.includes(selectedSeason) || 
                (selectedSeason === 'all' && itemSeasons.includes('all')) ||
                (itemSeasons.includes('all') && selectedSeasons.length > 0)
            );
        });
    }
    
    // 匹配场合（支持数组或单个值，多选过滤）
    if (selectedOccasions.length > 0) {
        filtered = filtered.filter(item => {
            const itemOccasions = Array.isArray(item.occasion) ? item.occasion : [item.occasion];
            return selectedOccasions.some(selectedOccasion => 
                itemOccasions.includes(selectedOccasion) ||
                (selectedOccasion === 'all' && itemOccasions.includes('all'))
            );
        });
    }
    
    // 匹配品牌
    if (brandFilter) {
        filtered = filtered.filter(item => {
            const brandValue = (item.brand || '').toLowerCase();
            return brandValue.includes(brandFilter);
        });
    }
    
    // 匹配尺寸
    if (sizeFilter) {
        filtered = filtered.filter(item => {
            const sizeValue = (item.size || '').toLowerCase();
            return sizeValue.includes(sizeFilter);
        });
    }
    
    // 匹配材质
    if (materialFilter) {
        filtered = filtered.filter(item => {
            const materialValue = (item.material || '').toLowerCase();
            return materialValue.includes(materialFilter);
        });
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
    
    // 预填充season和occasion（如果第一个物品有这些属性）
    const outfitSeasonSelect = document.getElementById('outfit-season');
    const outfitOccasionSelect = document.getElementById('outfit-occasion');
    
    if (selectedItems.length > 0) {
        const firstItem = selectedItems[0];
        if (firstItem.season) {
            const seasons = Array.isArray(firstItem.season) ? firstItem.season : [firstItem.season];
            Array.from(outfitSeasonSelect.options).forEach(opt => {
                opt.selected = seasons.includes(opt.value);
            });
        }
        if (firstItem.occasion) {
            const occasions = Array.isArray(firstItem.occasion) ? firstItem.occasion : [firstItem.occasion];
            Array.from(outfitOccasionSelect.options).forEach(opt => {
                opt.selected = occasions.includes(opt.value);
            });
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
    
    // 收集选中的季节（多选下拉菜单）
    const outfitSeasonSelect = document.getElementById('outfit-season');
    const seasons = Array.from(outfitSeasonSelect.selectedOptions).map(opt => opt.value);
    const season = seasons.length > 0 ? seasons : ['all'];
    
    // 收集选中的场合（多选下拉菜单）
    const outfitOccasionSelect = document.getElementById('outfit-occasion');
    const occasions = Array.from(outfitOccasionSelect.selectedOptions).map(opt => opt.value);
    const occasion = occasions.length > 0 ? occasions : ['casual'];
    
    const outfitData = {
        name: document.getElementById('outfit-name').value,
        season: season,
        occasion: occasion,
        notes: document.getElementById('outfit-notes').value || '',
        items: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image || item.originalImage || ''
        }))
    };
    
    try {
        console.log('[Outfit] Submitting outfit data:', outfitData);
        const result = await WardrobeAPI.createOutfit(outfitData);
        console.log('[Outfit] Outfit saved successfully:', result);
        Utils.showNotification('Outfit saved to server!', 'success');
        
        selectedItems = [];
        updateOutfitArea();
        saveOutfitForm.reset();
        // 清除多选下拉菜单的选择
        const outfitSeasonSelect = document.getElementById('outfit-season');
        const outfitOccasionSelect = document.getElementById('outfit-occasion');
        if (outfitSeasonSelect) outfitSeasonSelect.selectedIndex = -1;
        if (outfitOccasionSelect) outfitOccasionSelect.selectedIndex = -1;
        saveOutfitModal.style.display = 'none';
    } catch (error) {
        console.error('[Outfit] Failed to save outfit:', error);
        Utils.showNotification('Save failed: ' + (error.message || 'Please try again later.'), 'error');
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

outfitFilterType.addEventListener('change', filterAndDisplayItems);
document.getElementById('outfit-filter-season').addEventListener('change', filterAndDisplayItems);
document.getElementById('outfit-filter-occasion').addEventListener('change', filterAndDisplayItems);
outfitFilterBrand.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));
outfitFilterSize.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));
outfitFilterMaterial.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));

window.addEventListener('DOMContentLoaded', loadWardrobeForOutfit);
