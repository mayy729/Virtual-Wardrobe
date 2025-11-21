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
        const savedOutfits = await WardrobeAPI.listOutfits();
        allOutfits = savedOutfits.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
        filteredOutfits = [...allOutfits];
        displayOutfits();
    } catch (error) {
        console.error('Failed to load saved outfits:', error);
        Utils.renderError(savedOutfitsGrid, 'Unable to load saved outfits, please check the backend service.');
        Utils.showNotification('Unable to load outfit data, please try again later.', 'error');
    }
}

function displayOutfits() {
    if (filteredOutfits.length === 0) {
        savedOutfitsGrid.innerHTML = '<p class="empty-message">No outfits found matching the criteria</p>';
        return;
    }

    savedOutfitsGrid.innerHTML = '';
    
    filteredOutfits.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = 'saved-outfit-card';
        outfitCard.dataset.id = outfit.id;
        
        outfitCard.innerHTML = `
            <div class="outfit-card-header">
                <h3>${outfit.name}</h3>
                <button class="btn-delete-outfit" data-id="${outfit.id}">Delete</button>
            </div>
            <div class="outfit-card-items">
                ${outfit.items.map(item => `
                    <div class="outfit-item-preview">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                `).join('')}
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
                <p class="outfit-date">Created at: ${new Date(outfit.dateCreated).toLocaleDateString('zh-CN')}</p>
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
    
    // 收集选中的季节（多选下拉菜单）
    const savedFilterSeason = document.getElementById('saved-filter-season');
    const selectedSeasons = Array.from(savedFilterSeason.selectedOptions).map(opt => opt.value);
    
    // 收集选中的场合（多选下拉菜单）
    const savedFilterOccasion = document.getElementById('saved-filter-occasion');
    const selectedOccasions = Array.from(savedFilterOccasion.selectedOptions).map(opt => opt.value);
    
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

const debouncedApplyFilters = Utils.debounce(applyFilters, 250);
const savedFilterSeason = document.getElementById('saved-filter-season');
const savedFilterOccasion = document.getElementById('saved-filter-occasion');

outfitSearch.addEventListener('input', debouncedApplyFilters);
savedFilterSeason.addEventListener('change', applyFilters);
savedFilterOccasion.addEventListener('change', applyFilters);
savedFilterBrand.addEventListener('input', debouncedApplyFilters);
savedFilterSize.addEventListener('input', debouncedApplyFilters);
savedFilterMaterial.addEventListener('input', debouncedApplyFilters);

clearSavedFilters.addEventListener('click', function() {
    outfitSearch.value = '';
    savedFilterSeason.selectedIndex = -1;
    savedFilterOccasion.selectedIndex = -1;
    savedFilterBrand.value = '';
    savedFilterSize.value = '';
    savedFilterMaterial.value = '';
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
                    ${outfit.items.map(item => `
                        <div class="modal-item">
                            <img src="${item.image}" alt="${item.name}">
                            <p>${item.name}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <p class="modal-outfit-date">Created at: ${new Date(outfit.dateCreated).toLocaleDateString('zh-CN')}</p>
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
