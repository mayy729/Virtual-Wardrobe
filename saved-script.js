let allOutfits = [];
let filteredOutfits = [];

const savedOutfitsGrid = document.getElementById('saved-outfits-grid');
const outfitSearch = document.getElementById('outfit-search');
const savedFilterBrand = document.getElementById('saved-filter-brand');
const savedFilterSize = document.getElementById('saved-filter-size');
const savedFilterMaterial = document.getElementById('saved-filter-material');
const clearSavedFilters = document.getElementById('clear-saved-filters');
const outfitModal = document.getElementById('outfit-modal');
const outfitModalBody = document.getElementById('outfit-modal-body');
const closeModal = document.querySelector('.close-modal');

async function loadSavedOutfits() {
    Utils.renderLoading(savedOutfitsGrid, 'Loading saved combinations...');
    try {
        console.log('[Saved] Loading outfits from server...');
        const savedOutfits = await WardrobeAPI.listOutfits();
        console.log('[Saved] Received outfits:', savedOutfits.length, savedOutfits);
        if (!savedOutfits || savedOutfits.length === 0) {
            console.log('[Saved] No outfits found');
            allOutfits = [];
            filteredOutfits = [];
            displayOutfits();
            return;
        }
        allOutfits = savedOutfits.sort((a, b) => {
            const dateA = new Date(a.dateCreated || a.dateAdded || 0);
            const dateB = new Date(b.dateCreated || b.dateAdded || 0);
            return dateB - dateA;
        });
        filteredOutfits = [...allOutfits];
        console.log('[Saved] Processed outfits:', allOutfits.length, allOutfits);
        displayOutfits();
    } catch (error) {
        console.error('[Saved] Failed to load saved outfits:', error);
        Utils.renderError(savedOutfitsGrid, 'Unable to load saved outfits, please check the backend service.');
        Utils.showNotification('Unable to load outfit data, please try again later.', 'error');
    }
}

function displayOutfits() {
    console.log('[Saved] Displaying outfits, filtered count:', filteredOutfits.length, 'all count:', allOutfits.length);
    if (filteredOutfits.length === 0) {
        if (allOutfits.length === 0) {
            savedOutfitsGrid.innerHTML = '<p class="empty-message">You haven\'t saved any outfits yet, go create your first outfit!</p>';
        } else {
            savedOutfitsGrid.innerHTML = '<p class="empty-message">No outfits found matching the criteria</p>';
        }
        return;
    }

    savedOutfitsGrid.innerHTML = '';
    
    filteredOutfits.forEach(outfit => {
        console.log('[Saved] Displaying outfit:', outfit.id, outfit.name, 'items:', outfit.items, 'items type:', typeof outfit.items, 'isArray:', Array.isArray(outfit.items));
        const outfitCard = document.createElement('div');
        outfitCard.className = 'saved-outfit-card';
        outfitCard.dataset.id = outfit.id;
        
        // 确保items是数组
        const items = Array.isArray(outfit.items) ? outfit.items : (outfit.items ? [outfit.items] : []);
        console.log('[Saved] Processed items for display:', items);
        
        outfitCard.innerHTML = `
            <div class="outfit-card-header">
                <h3>${outfit.name || 'Unnamed Outfit'}</h3>
                <button class="btn-delete-outfit" data-id="${outfit.id}">Delete</button>
            </div>
            <div class="outfit-card-items">
                ${items.length > 0 ? items.map(item => {
                    // 处理items可能是对象数组或数字数组
                    if (typeof item === 'object' && item !== null && item.image) {
                        return `
                            <div class="outfit-item-preview">
                                <img src="${item.image}" alt="${item.name || 'Item'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div style="display:none;">${item.name || 'Item'}</div>
                            </div>
                        `;
                    } else if (typeof item === 'object' && item !== null && item.id) {
                        return `
                            <div class="outfit-item-preview">
                                <div class="outfit-item-placeholder">${item.name || 'Item ' + item.id}</div>
                            </div>
                        `;
                    } else {
                        // 如果是数字ID或其他格式
                        return `
                            <div class="outfit-item-preview">
                                <div class="outfit-item-placeholder">Item ${item}</div>
                            </div>
                        `;
                    }
                }).join('') : '<p class="empty-message">No items in this outfit</p>'}
            </div>
            <div class="outfit-card-info">
                <div class="outfit-tags">
                    ${Array.isArray(outfit.season) 
                        ? outfit.season.map(s => `<span class="tag tag-season">${getSeasonLabel(s)}</span>`).join('')
                        : `<span class="tag tag-season">${getSeasonLabel(outfit.season)}</span>`}
                    ${Array.isArray(outfit.occasion) 
                        ? outfit.occasion.map(o => `<span class="tag tag-occasion">${getOccasionLabel(o)}</span>`).join('')
                        : `<span class="tag tag-occasion">${getOccasionLabel(outfit.occasion)}</span>`}
                </div>
                ${outfit.notes ? `<p class="outfit-notes">💬 ${outfit.notes}</p>` : ''}
                <p class="outfit-date">Created at: ${new Date(outfit.dateCreated || outfit.dateAdded || Date.now()).toLocaleDateString('zh-CN')}</p>
            </div>
            <button class="btn-view-outfit" data-id="${outfit.id}">View Details</button>
        `;
        
        savedOutfitsGrid.appendChild(outfitCard);
    });
}

function getSeasonLabel(season) {
    const labels = {
        spring: '🌼 Spring',
        summer: '🌴 Summer',
        autumn: '🍂 Autumn',
        winter: '❄️ Winter',
        all: '🌏 All Seasons'
    };
    if (Array.isArray(season)) {
        return season.map(s => labels[s] || s).join(', ');
    }
    return labels[season] || season;
}

function getOccasionLabel(occasion) {
    const labels = {
        casual: '👚 Casual',
        date: '💕 Date',
        work: '💼 Work',
        party: '🎉 Party',
        formal: '👔 Formal Occasion',
        sport: '🏃 Sport',
        all: '🌏 All Occasions'
    };
    if (Array.isArray(occasion)) {
        return occasion.map(o => labels[o] || o).join(', ');
    }
    return labels[occasion] || occasion;
}

function applyFilters() {
    const searchTerm = outfitSearch.value.toLowerCase();
    
    // 收集选中的季节（checkbox）
    const seasonCheckboxes = document.querySelectorAll('input[name="saved-filter-season"]:checked');
    const selectedSeasons = Array.from(seasonCheckboxes).map(cb => cb.value);
    
    // 收集选中的场合（checkbox）
    const occasionCheckboxes = document.querySelectorAll('input[name="saved-filter-occasion"]:checked');
    const selectedOccasions = Array.from(occasionCheckboxes).map(cb => cb.value);
    
    const brandFilter = (savedFilterBrand.value || '').toLowerCase();
    const sizeFilter = (savedFilterSize.value || '').toLowerCase();
    const materialFilter = (savedFilterMaterial.value || '').toLowerCase();
    
    filteredOutfits = allOutfits.filter(outfit => {
        const matchesSearch = !searchTerm || 
            outfit.name.toLowerCase().includes(searchTerm) ||
            (outfit.notes && outfit.notes.toLowerCase().includes(searchTerm));
        
        // 匹配季节（支持数组或单个值，多选过滤）
        let matchesSeason = true;
        if (selectedSeasons.length > 0) {
            const outfitSeasons = Array.isArray(outfit.season) ? outfit.season : [outfit.season];
            matchesSeason = selectedSeasons.some(selectedSeason => 
                outfitSeasons.includes(selectedSeason) || 
                (selectedSeason === 'all' && outfitSeasons.includes('all')) ||
                (outfitSeasons.includes('all') && selectedSeasons.length > 0)
            );
        }
        
        // 匹配场合（支持数组或单个值，多选过滤）
        let matchesOccasion = true;
        if (selectedOccasions.length > 0) {
            const outfitOccasions = Array.isArray(outfit.occasion) ? outfit.occasion : [outfit.occasion];
            matchesOccasion = selectedOccasions.some(selectedOccasion => 
                outfitOccasions.includes(selectedOccasion) ||
                (selectedOccasion === 'all' && outfitOccasions.includes('all'))
            );
        }
        
        // 匹配品牌、尺寸、材质（基于outfit名称和notes进行搜索，因为outfit.items只包含id, name, image）
        // 注意：如果需要更精确的过滤，需要修改outfit保存逻辑来包含完整的item信息
        let matchesBrand = true;
        let matchesSize = true;
        let matchesMaterial = true;
        
        if (brandFilter || sizeFilter || materialFilter) {
            const outfitText = (outfit.name + ' ' + (outfit.notes || '')).toLowerCase();
            matchesBrand = !brandFilter || outfitText.includes(brandFilter);
            matchesSize = !sizeFilter || outfitText.includes(sizeFilter);
            matchesMaterial = !materialFilter || outfitText.includes(materialFilter);
        }
        
        return matchesSearch && matchesSeason && matchesOccasion && 
               matchesBrand && matchesSize && matchesMaterial;
    });
    
    displayOutfits();
}

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
            applyFilters();
        });
    });
    
    updateText();
}

// 初始化多选下拉组件
initMultiselect('saved-filter-season-trigger', 'saved-filter-season-dropdown', 'saved-filter-season', 'All Seasons');
initMultiselect('saved-filter-occasion-trigger', 'saved-filter-occasion-dropdown', 'saved-filter-occasion', 'All Occasions');

// 点击外部关闭下拉菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multiselect-trigger').forEach(t => t.classList.remove('active'));
    }
});

const debouncedApplyFilters = Utils.debounce(applyFilters, 250);

outfitSearch.addEventListener('input', debouncedApplyFilters);
document.querySelectorAll('input[name="saved-filter-season"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
});
document.querySelectorAll('input[name="saved-filter-occasion"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
});
savedFilterBrand.addEventListener('input', debouncedApplyFilters);
savedFilterSize.addEventListener('input', debouncedApplyFilters);
savedFilterMaterial.addEventListener('input', debouncedApplyFilters);

clearSavedFilters.addEventListener('click', function() {
    outfitSearch.value = '';
    document.querySelectorAll('input[name="saved-filter-season"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="saved-filter-occasion"]').forEach(cb => cb.checked = false);
    savedFilterBrand.value = '';
    savedFilterSize.value = '';
    savedFilterMaterial.value = '';
    initMultiselect('saved-filter-season-trigger', 'saved-filter-season-dropdown', 'saved-filter-season', 'All Seasons');
    initMultiselect('saved-filter-occasion-trigger', 'saved-filter-occasion-dropdown', 'saved-filter-occasion', 'All Occasions');
    applyFilters();
});

savedOutfitsGrid.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-view-outfit')) {
        const outfitId = parseInt(e.target.dataset.id);
        const outfit = allOutfits.find(o => o.id === outfitId);
        if (outfit) {
            showOutfitModal(outfit);
        }
    }
    
    if (e.target.classList.contains('btn-delete-outfit')) {
        const outfitId = parseInt(e.target.dataset.id);
        const confirmed = Utils.confirm ? Utils.confirm('Are you sure you want to delete this outfit?') : confirm('Are you sure you want to delete this outfit?');
        if (confirmed) {
            deleteOutfit(outfitId);
        }
    }
});

function showOutfitModal(outfit) {
    outfitModalBody.innerHTML = `
        <div class="modal-outfit-content">
            <h2>${outfit.name}</h2>
            <div class="modal-outfit-tags">
                ${Array.isArray(outfit.season) 
                    ? outfit.season.map(s => `<span class="tag tag-season">${getSeasonLabel(s)}</span>`).join('')
                    : `<span class="tag tag-season">${getSeasonLabel(outfit.season)}</span>`}
                ${Array.isArray(outfit.occasion) 
                    ? outfit.occasion.map(o => `<span class="tag tag-occasion">${getOccasionLabel(o)}</span>`).join('')
                    : `<span class="tag tag-occasion">${getOccasionLabel(outfit.occasion)}</span>`}
            </div>
            ${outfit.notes ? `<p class="modal-outfit-notes">${outfit.notes}</p>` : ''}
            <div class="modal-outfit-items">
                <h3>Outfit Items</h3>
                <div class="modal-items-grid">
                    ${(outfit.items && Array.isArray(outfit.items) ? outfit.items : []).map(item => {
                        // 处理items可能是对象数组或数字数组
                        if (typeof item === 'object' && item.image) {
                            return `
                                <div class="modal-item">
                                    <img src="${item.image}" alt="${item.name || 'Item'}">
                                    <p>${item.name || 'Unknown'}</p>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="modal-item">
                                    <div class="outfit-item-placeholder">Item ${item}</div>
                                    <p>Item ID: ${item}</p>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            </div>
            <p class="modal-outfit-date">Created at: ${new Date(outfit.dateCreated || outfit.dateAdded || Date.now()).toLocaleDateString('zh-CN')}</p>
        </div>
    `;
    outfitModal.style.display = 'block';
}

closeModal.addEventListener('click', function() {
    outfitModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === outfitModal) {
        outfitModal.style.display = 'none';
    }
});

async function deleteOutfit(outfitId) {
    try {
        await WardrobeAPI.deleteOutfit(outfitId);
        allOutfits = allOutfits.filter(outfit => outfit.id !== outfitId);
        filteredOutfits = filteredOutfits.filter(outfit => outfit.id !== outfitId);
        displayOutfits();
        Utils.showNotification('Outfit deleted successfully.', 'success');
    } catch (error) {
        console.error('Failed to delete outfit:', error);
        Utils.showNotification('Delete failed, please try again later.', 'error');
    }
}

window.addEventListener('DOMContentLoaded', loadSavedOutfits);
