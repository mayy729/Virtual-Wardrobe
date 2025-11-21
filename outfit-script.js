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
    
    // 收集选中的季节（checkbox）
    const seasonCheckboxes = document.querySelectorAll('input[name="outfit-filter-season"]:checked');
    const selectedSeasons = Array.from(seasonCheckboxes).map(cb => cb.value);
    
    // 收集选中的场合（checkbox）
    const occasionCheckboxes = document.querySelectorAll('input[name="outfit-filter-occasion"]:checked');
    const selectedOccasions = Array.from(occasionCheckboxes).map(cb => cb.value);
    
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
        // 如果选择了"all"，不进行过滤（显示所有）
        if (!selectedSeasons.includes('all')) {
            filtered = filtered.filter(item => {
                const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
                // 如果item有"all"，匹配所有选中的season
                if (itemSeasons.includes('all')) {
                    return true;
                } else {
                    return selectedSeasons.some(selectedSeason => 
                        itemSeasons.includes(selectedSeason)
                    );
                }
            });
        }
    }
    
    // 匹配场合（支持数组或单个值，多选过滤）
    if (selectedOccasions.length > 0) {
        // 如果选择了"all"，不进行过滤（显示所有）
        if (!selectedOccasions.includes('all')) {
            filtered = filtered.filter(item => {
                const itemOccasions = Array.isArray(item.occasion) ? item.occasion : [item.occasion];
                // 如果item有"all"，匹配所有选中的occasion
                if (itemOccasions.includes('all')) {
                    return true;
                } else {
                    return selectedOccasions.some(selectedOccasion => 
                        itemOccasions.includes(selectedOccasion)
                    );
                }
            });
        }
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
    if (selectedItems.length > 0) {
        const firstItem = selectedItems[0];
        if (firstItem.season) {
            const seasons = Array.isArray(firstItem.season) ? firstItem.season : [firstItem.season];
            document.querySelectorAll('input[name="outfit-season"]').forEach(cb => {
                cb.checked = seasons.includes(cb.value);
            });
        }
        if (firstItem.occasion) {
            const occasions = Array.isArray(firstItem.occasion) ? firstItem.occasion : [firstItem.occasion];
            document.querySelectorAll('input[name="outfit-occasion"]').forEach(cb => {
                cb.checked = occasions.includes(cb.value);
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
    
    // 收集选中的季节（checkbox）
    const seasonCheckboxes = document.querySelectorAll('input[name="outfit-season"]:checked');
    const seasons = Array.from(seasonCheckboxes).map(cb => cb.value);
    const season = seasons.length > 0 ? seasons : ['all'];
    
    // 收集选中的场合（checkbox）
    const occasionCheckboxes = document.querySelectorAll('input[name="outfit-occasion"]:checked');
    const occasions = Array.from(occasionCheckboxes).map(cb => cb.value);
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
        // 清除checkbox的选择
        document.querySelectorAll('input[name="outfit-season"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="outfit-occasion"]').forEach(cb => cb.checked = false);
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

// 初始化自定义多选下拉组件
function initMultiselect(triggerId, dropdownId, checkboxName, defaultText) {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    const checkboxes = dropdown.querySelectorAll(`input[name="${checkboxName}"]`);
    const textSpan = trigger.querySelector('.multiselect-text');
    
    function updateText() {
        const selected = Array.from(checkboxes).filter(cb => cb.checked);
        if (selected.length === 0) {
            textSpan.textContent = defaultText;
        } else if (selected.length === 1) {
            textSpan.textContent = selected[0].nextElementSibling.textContent;
        } else {
            textSpan.textContent = `${selected.length} selected`;
        }
    }
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = trigger.classList.contains('active');
        document.querySelectorAll('.multiselect-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multiselect-trigger').forEach(t => t.classList.remove('active'));
        if (!isActive) {
            dropdown.classList.add('show');
            trigger.classList.add('active');
        }
    });
    
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            updateText();
            filterAndDisplayItems();
        });
    });
    
    updateText();
}

// 初始化多选下拉组件（只用于过滤器，不用于save modal）
initMultiselect('outfit-filter-season-trigger', 'outfit-filter-season-dropdown', 'outfit-filter-season', 'All Seasons');
initMultiselect('outfit-filter-occasion-trigger', 'outfit-filter-occasion-dropdown', 'outfit-filter-occasion', 'All Occasions');

// 点击外部关闭下拉菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multiselect-trigger').forEach(t => t.classList.remove('active'));
    }
});

outfitFilterType.addEventListener('change', filterAndDisplayItems);
document.querySelectorAll('input[name="outfit-filter-season"]').forEach(cb => {
    cb.addEventListener('change', filterAndDisplayItems);
});
document.querySelectorAll('input[name="outfit-filter-occasion"]').forEach(cb => {
    cb.addEventListener('change', filterAndDisplayItems);
});
outfitFilterBrand.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));
outfitFilterSize.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));
outfitFilterMaterial.addEventListener('input', Utils.debounce(filterAndDisplayItems, 250));

window.addEventListener('DOMContentLoaded', loadWardrobeForOutfit);
