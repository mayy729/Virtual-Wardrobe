let allItems = [];
let filteredItems = [];

const ITEMS_PER_PAGE = 20;
let currentPage = 1;

const searchInput = document.getElementById('search-input');
const filterType = document.getElementById('filter-type');
const filterBrand = document.getElementById('filter-brand');
const filterSize = document.getElementById('filter-size');
const filterMaterial = document.getElementById('filter-material');
const clearFiltersBtn = document.getElementById('clear-filters');
const wardrobeItems = document.getElementById('wardrobe-items');
const itemModal = document.getElementById('item-modal');
const closeModal = document.querySelector('.close-modal');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const PLACEHOLDER_IMAGE = './hello-kitty-bg.jpg';

async function loadWardrobe() {
    Utils.renderLoading(wardrobeItems, 'Loading wardrobe from server...');
    try {
        const wardrobe = await WardrobeAPI.listClothes();
        allItems = wardrobe;
        filteredItems = [...allItems];
        displayItems();
        updateStats();
    } catch (error) {
        console.error('Failed to load wardrobe:', error);
        Utils.renderError(wardrobeItems, 'Unable to load wardrobe data, please try again later.');
        if (window.Utils) {
            Utils.showNotification('Unable to connect to wardrobe server, please try again later.', 'error');
        }
    }
}

function displayItems() {
    if (filteredItems.length === 0) {
        wardrobeItems.innerHTML = '<p class="empty-message">No items found that match the criteria</p>';
        pagination.style.display = 'none';
        return;
    }

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
    const itemsToShow = filteredItems.slice(startIndex, endIndex);

    wardrobeItems.innerHTML = '';
    
    itemsToShow.forEach(item => {
        const imageSrc = item.image || item.originalImage || PLACEHOLDER_IMAGE;
        const itemCard = document.createElement('div');
        itemCard.className = 'wardrobe-item-card';
        itemCard.dataset.id = item.id;
        
        // 处理季节标签（支持数组或单个值）
        let seasonTags = '';
        if (Array.isArray(item.season)) {
            seasonTags = item.season.map(s => `<span class="tag tag-season">${getSeasonLabel(s)}</span>`).join('');
        } else if (item.season) {
            seasonTags = `<span class="tag tag-season">${getSeasonLabel(item.season)}</span>`;
        }
        
        // 处理场合标签（支持数组或单个值）
        let occasionTags = '';
        if (Array.isArray(item.occasion)) {
            occasionTags = item.occasion.map(o => `<span class="tag tag-occasion">${getOccasionLabel(o)}</span>`).join('');
        } else if (item.occasion) {
            occasionTags = `<span class="tag tag-occasion">${getOccasionLabel(item.occasion)}</span>`;
        }
        
        itemCard.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${imageSrc}" alt="${item.name}" loading="lazy">
                ${item.wearingPhoto ? '<span class="wearing-photo-badge">📷</span>' : ''}
            </div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="item-tags">
                    ${seasonTags}
                    ${occasionTags}
                </div>
                ${item.notes ? `<p class="item-notes">💬 ${item.notes}</p>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-view" data-id="${item.id}">View Details</button>
                <button class="btn-delete" data-id="${item.id}">Delete</button>
            </div>
        `;
        
        wardrobeItems.appendChild(itemCard);
    });
    
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function getSeasonLabel(season) {
    const labels = {
        spring: '🌼 Spring',
        summer: '🌴 Summer',
        autumn: '🍂 Autumn',
        winter: '❄️ Winter',
        all: '🌏 All Seasons'
    };
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
    return labels[occasion] || occasion;
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const type = filterType.value;
    
    // 收集选中的季节（checkbox）
    const seasonCheckboxes = document.querySelectorAll('input[name="filter-season"]:checked');
    const selectedSeasons = Array.from(seasonCheckboxes).map(cb => cb.value);
    
    // 收集选中的场合（checkbox）
    const occasionCheckboxes = document.querySelectorAll('input[name="filter-occasion"]:checked');
    const selectedOccasions = Array.from(occasionCheckboxes).map(cb => cb.value);
    
    const brand = filterBrand.value.toLowerCase();
    const size = filterSize.value.toLowerCase();
    const material = filterMaterial.value.toLowerCase();
    
    currentPage = 1;
    
    filteredItems = allItems.filter(item => {
        const brandValue = (item.brand || '').toLowerCase();
        const sizeValue = (item.size || '').toLowerCase();
        const materialValue = (item.material || '').toLowerCase();
        const notesValue = (item.notes || '').toLowerCase();
        const nameValue = (item.name || '').toLowerCase();
        
        const matchesSearch = !searchTerm || 
            nameValue.includes(searchTerm) ||
            brandValue.includes(searchTerm) ||
            notesValue.includes(searchTerm);
        
        // 匹配类型
        const matchesType = !type || (item.type || 'clothes') === type;
        
        // 匹配季节（支持数组或单个值，多选过滤）
        let matchesSeason = true;
        if (selectedSeasons.length > 0) {
            // 如果选择了"all"，匹配所有items
            if (selectedSeasons.includes('all')) {
                matchesSeason = true;
            } else {
                const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
                // 如果item有"all"，匹配所有选中的season
                if (itemSeasons.includes('all')) {
                    matchesSeason = true;
                } else {
                    matchesSeason = selectedSeasons.some(selectedSeason => 
                        itemSeasons.includes(selectedSeason)
                    );
                }
            }
        }
        
        // 匹配场合（支持数组或单个值，多选过滤）
        let matchesOccasion = true;
        if (selectedOccasions.length > 0) {
            // 如果选择了"all"，匹配所有items
            if (selectedOccasions.includes('all')) {
                matchesOccasion = true;
            } else {
                const itemOccasions = Array.isArray(item.occasion) ? item.occasion : [item.occasion];
                // 如果item有"all"，匹配所有选中的occasion
                if (itemOccasions.includes('all')) {
                    matchesOccasion = true;
                } else {
                    matchesOccasion = selectedOccasions.some(selectedOccasion => 
                        itemOccasions.includes(selectedOccasion)
                    );
                }
            }
        }
        
        const matchesBrand = !brand || brandValue.includes(brand);
        
        const matchesSize = !size || sizeValue.includes(size);
        
        const matchesMaterial = !material || materialValue.includes(material);
        
        return matchesSearch && matchesType && matchesSeason && matchesOccasion && 
               matchesBrand && matchesSize && matchesMaterial;
    });
    
    displayItems();
    updateStats();
}

function updateStats() {
    document.getElementById('total-items').textContent = allItems.length;
    document.getElementById('filtered-items').textContent = filteredItems.length;
}

const debouncedApplyFilters = Utils.debounce(applyFilters, 250);

// 初始化自定义多选下拉组件
function initMultiselect(triggerId, dropdownId, checkboxName, defaultText) {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);
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
initMultiselect('filter-season-trigger', 'filter-season-dropdown', 'filter-season', 'All Seasons');
initMultiselect('filter-occasion-trigger', 'filter-occasion-dropdown', 'filter-occasion', 'All Occasions');

// 点击外部关闭下拉菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multiselect-trigger').forEach(t => t.classList.remove('active'));
    }
});

searchInput.addEventListener('input', debouncedApplyFilters);
filterType.addEventListener('change', applyFilters);
filterBrand.addEventListener('input', debouncedApplyFilters);
filterSize.addEventListener('input', debouncedApplyFilters);
filterMaterial.addEventListener('input', debouncedApplyFilters);

clearFiltersBtn.addEventListener('click', function() {
    searchInput.value = '';
    filterType.value = '';
    document.querySelectorAll('input[name="filter-season"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="filter-occasion"]').forEach(cb => cb.checked = false);
    filterBrand.value = '';
    filterSize.value = '';
    filterMaterial.value = '';
    initMultiselect('filter-season-trigger', 'filter-season-dropdown', 'filter-season', 'All Seasons');
    initMultiselect('filter-occasion-trigger', 'filter-occasion-dropdown', 'filter-occasion', 'All Occasions');
    applyFilters();
});

wardrobeItems.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-view')) {
        const itemId = parseInt(e.target.dataset.id);
        const item = allItems.find(i => i.id === itemId);
        if (item) {
            showItemModal(item);
        }
    }
    
    if (e.target.classList.contains('btn-delete')) {
        const itemId = parseInt(e.target.dataset.id);
        const confirmed = Utils.confirm ? Utils.confirm('Are you sure you want to delete this item?') : confirm('Are you sure you want to delete this item?');
        if (confirmed) {
            deleteItem(itemId);
        }
    }
});

let isEditingItem = false;
let currentEditingItem = null;

function showItemModal(item, editMode = false) {
    isEditingItem = editMode;
    currentEditingItem = item;
    const modalBody = document.getElementById('modal-body');
    
    if (editMode) {
        // 编辑模式
        const seasons = Array.isArray(item.season) ? item.season : [item.season];
        const occasions = Array.isArray(item.occasion) ? item.occasion : [item.occasion];
        
        modalBody.innerHTML = `
            <div class="modal-item-content">
                <div class="modal-image-section">
                    <img src="${item.image}" alt="${item.name}">
                    ${item.wearingPhoto ? `
                        <div class="wearing-photo-section">
                            <h4>Wearing Effect</h4>
                            <img src="${item.wearingPhoto}" alt="Wearing Effect" id="edit-wearing-preview">
                        </div>
                    ` : '<div class="wearing-photo-section" style="display:none;"><h4>Wearing Effect</h4><img id="edit-wearing-preview" alt="Wearing Effect"></div>'}
                    <input type="file" id="edit-wearing-photo" accept="image/*" style="margin-top: 10px;">
                </div>
                <div class="modal-details-section">
                    <h2>Edit Item</h2>
                    <form id="edit-item-form">
                        <div class="form-group">
                            <label for="edit-item-name">Name:</label>
                            <input type="text" id="edit-item-name" value="${item.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Season: <span class="form-hint">(Select multiple)</span></label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-season" value="spring" ${seasons.includes('spring') ? 'checked' : ''}>
                                    🌼 Spring
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-season" value="summer" ${seasons.includes('summer') ? 'checked' : ''}>
                                    🌴 Summer
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-season" value="autumn" ${seasons.includes('autumn') ? 'checked' : ''}>
                                    🍂 Autumn
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-season" value="winter" ${seasons.includes('winter') ? 'checked' : ''}>
                                    ❄️ Winter
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-season" value="all" ${seasons.includes('all') ? 'checked' : ''}>
                                    🌏 All Seasons
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Occasion: <span class="form-hint">(Select multiple)</span></label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="casual" ${occasions.includes('casual') ? 'checked' : ''}>
                                    👚 Casual
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="date" ${occasions.includes('date') ? 'checked' : ''}>
                                    💕 Date
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="work" ${occasions.includes('work') ? 'checked' : ''}>
                                    💼 Work
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="party" ${occasions.includes('party') ? 'checked' : ''}>
                                    🎉 Party
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="formal" ${occasions.includes('formal') ? 'checked' : ''}>
                                    👔 Formal Occasion
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="sport" ${occasions.includes('sport') ? 'checked' : ''}>
                                    🏃 Sport
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="edit-item-occasion" value="all" ${occasions.includes('all') ? 'checked' : ''}>
                                    🌏 All Occasions
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-item-brand">Brand:</label>
                            <input type="text" id="edit-item-brand" value="${item.brand || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-item-size">Size:</label>
                            <input type="text" id="edit-item-size" value="${item.size || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-item-material">Material:</label>
                            <input type="text" id="edit-item-material" value="${item.material || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-item-notes">Notes:</label>
                            <textarea id="edit-item-notes" rows="3">${item.notes || ''}</textarea>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="btn-primary">Save Changes</button>
                            <button type="button" class="btn-secondary" id="cancel-edit-item">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 设置事件监听器
        setupEditItemForm(item.id);
    } else {
        // 查看模式
        modalBody.innerHTML = `
            <div class="modal-item-content">
                <div class="modal-image-section">
                    <img src="${item.image}" alt="${item.name}">
                    ${item.wearingPhoto ? `
                        <div class="wearing-photo-section">
                            <h4>Wearing Effect</h4>
                            <img src="${item.wearingPhoto}" alt="Wearing Effect">
                        </div>
                    ` : ''}
                </div>
                <div class="modal-details-section">
                    <h2>${item.name}</h2>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Season:</span>
                            <span class="detail-value">
                                ${Array.isArray(item.season) 
                                    ? item.season.map(s => getSeasonLabel(s)).join(', ') 
                                    : getSeasonLabel(item.season)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Occasion:</span>
                            <span class="detail-value">
                                ${Array.isArray(item.occasion) 
                                    ? item.occasion.map(o => getOccasionLabel(o)).join(', ') 
                                    : getOccasionLabel(item.occasion)}
                            </span>
                        </div>
                        ${item.brand ? `
                            <div class="detail-item">
                                <span class="detail-label">Brand:</span>
                                <span class="detail-value">${item.brand}</span>
                            </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Size:</span>
                            <span class="detail-value">${item.size || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Material:</span>
                            <span class="detail-value">${item.material || 'N/A'}</span>
                        </div>
                        ${item.notes ? `
                            <div class="detail-item full-width">
                                <span class="detail-label">Notes:</span>
                                <span class="detail-value">${item.notes}</span>
                            </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Added Date:</span>
                            <span class="detail-value">${new Date(item.dateAdded).toLocaleDateString('zh-CN')}</span>
                        </div>
                    </div>
                    <div class="button-group" style="margin-top: 20px;">
                        <button class="btn-primary" id="edit-item-btn">Edit</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加编辑按钮事件
        document.getElementById('edit-item-btn').addEventListener('click', () => {
            showItemModal(item, true);
        });
    }
    itemModal.style.display = 'block';
}

function setupEditItemForm(itemId) {
    const form = document.getElementById('edit-item-form');
    const cancelBtn = document.getElementById('cancel-edit-item');
    const wearingPhotoInput = document.getElementById('edit-wearing-photo');
    const wearingPreview = document.getElementById('edit-wearing-preview');
    const wearingSection = wearingPreview?.closest('.wearing-photo-section');
    
    // 处理wearing photo上传
    if (wearingPhotoInput) {
        wearingPhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    Utils.showNotification('Wearing photo is too large (max 5MB)', 'error');
                    return;
                }
                const base64 = await Utils.fileToBase64(file);
                if (wearingPreview) {
                    wearingPreview.src = base64;
                    if (wearingSection) {
                        wearingSection.style.display = 'block';
                    }
                }
            }
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        try {
            // 收集表单数据
            const name = document.getElementById('edit-item-name').value.trim();
            const brand = document.getElementById('edit-item-brand').value.trim();
            const size = document.getElementById('edit-item-size').value.trim();
            const material = document.getElementById('edit-item-material').value.trim();
            const notes = document.getElementById('edit-item-notes').value.trim();
            
            // 收集季节和场合
            const seasonCheckboxes = document.querySelectorAll('input[name="edit-item-season"]:checked');
            const seasons = Array.from(seasonCheckboxes).map(cb => cb.value);
            const season = seasons.length > 0 ? seasons : ['all'];
            
            const occasionCheckboxes = document.querySelectorAll('input[name="edit-item-occasion"]:checked');
            const occasions = Array.from(occasionCheckboxes).map(cb => cb.value);
            const occasion = occasions.length > 0 ? occasions : ['casual'];
            
            // 处理wearing photo
            let wearingPhoto = currentEditingItem.wearingPhoto || null;
            if (wearingPhotoInput && wearingPhotoInput.files[0]) {
                wearingPhoto = await Utils.fileToBase64(wearingPhotoInput.files[0]);
            }
            
            const updateData = {
                name: name.substring(0, 200),
                season: season,
                occasion: occasion,
                brand: brand.substring(0, 100),
                size: size.substring(0, 50),
                material: material.substring(0, 100),
                notes: notes.substring(0, 500),
                wearingPhoto: wearingPhoto
            };
            
            console.log('[Wardrobe] Updating item:', itemId, updateData);
            const result = await WardrobeAPI.updateClothes(itemId, updateData);
            console.log('[Wardrobe] Item updated successfully:', result);
            
            // 更新本地数据
            const itemIndex = allItems.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                allItems[itemIndex] = { ...allItems[itemIndex], ...result };
            }
            
            // 重新应用过滤和显示
            applyFilters();
            
            Utils.showNotification('Item updated successfully!', 'success');
            itemModal.style.display = 'none';
        } catch (error) {
            console.error('[Wardrobe] Failed to update item:', error);
            Utils.showNotification('Failed to update item: ' + (error.message || 'Please try again'), 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            showItemModal(currentEditingItem, false);
        });
    }
}

closeModal.addEventListener('click', function() {
    itemModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === itemModal) {
        itemModal.style.display = 'none';
    }
});

async function deleteItem(itemId) {
    try {
        await WardrobeAPI.deleteClothes(itemId);
        allItems = allItems.filter(item => item.id !== itemId);
        filteredItems = filteredItems.filter(item => item.id !== itemId);
        displayItems();
        updateStats();
        Utils.showNotification('Item deleted successfully.', 'success');
    } catch (error) {
        console.error('Failed to delete item:', error);
        Utils.showNotification('Delete failed, please try again later.', 'error');
    }
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayItems();
        wardrobeItems.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        displayItems();
        wardrobeItems.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

window.addEventListener('DOMContentLoaded', loadWardrobe);
