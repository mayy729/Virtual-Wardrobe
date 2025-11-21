let allOutfits = [];
let filteredOutfits = [];

const savedOutfitsGrid = document.getElementById('saved-outfits-grid');
const outfitSearch = document.getElementById('outfit-search');
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
    
    filteredOutfits = allOutfits.filter(outfit => {
        const matchesSearch = !searchTerm || 
            outfit.name.toLowerCase().includes(searchTerm) ||
            (outfit.notes && outfit.notes.toLowerCase().includes(searchTerm));
        
        // 匹配季节（支持数组或单个值，多选过滤）
        let matchesSeason = true;
        if (selectedSeasons.length > 0) {
            // 如果选择了"all"，匹配所有outfits
            if (selectedSeasons.includes('all')) {
                matchesSeason = true;
            } else {
                const outfitSeasons = Array.isArray(outfit.season) ? outfit.season : [outfit.season];
                // 只有当outfit包含选中的season，或者outfit有"all"时，才匹配
                matchesSeason = selectedSeasons.some(selectedSeason => 
                    outfitSeasons.includes(selectedSeason)
                ) || outfitSeasons.includes('all');
            }
        }
        
        // 匹配场合（支持数组或单个值，多选过滤）
        let matchesOccasion = true;
        if (selectedOccasions.length > 0) {
            // 如果选择了"all"，匹配所有outfits
            if (selectedOccasions.includes('all')) {
                matchesOccasion = true;
            } else {
                const outfitOccasions = Array.isArray(outfit.occasion) ? outfit.occasion : [outfit.occasion];
                // 只有当outfit包含选中的occasion，或者outfit有"all"时，才匹配
                matchesOccasion = selectedOccasions.some(selectedOccasion => 
                    outfitOccasions.includes(selectedOccasion)
                ) || outfitOccasions.includes('all');
            }
        }
        
        return matchesSearch && matchesSeason && matchesOccasion;
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

clearSavedFilters.addEventListener('click', function() {
    outfitSearch.value = '';
    document.querySelectorAll('input[name="saved-filter-season"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="saved-filter-occasion"]').forEach(cb => cb.checked = false);
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

let isEditingOutfit = false;
let currentEditingOutfit = null;

function showOutfitModal(outfit, editMode = false) {
    isEditingOutfit = editMode;
    currentEditingOutfit = outfit;
    
    if (editMode) {
        // 编辑模式
        const seasons = Array.isArray(outfit.season) ? outfit.season : [outfit.season];
        const occasions = Array.isArray(outfit.occasion) ? outfit.occasion : [outfit.occasion];
        
        outfitModalBody.innerHTML = `
            <div class="modal-outfit-content">
                <h2>Edit Outfit</h2>
                <form id="edit-outfit-form">
                    <div class="form-group">
                        <label for="edit-outfit-name">Outfit Name:</label>
                        <input type="text" id="edit-outfit-name" value="${outfit.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Season: <span class="form-hint">(Select multiple)</span></label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-season" value="spring" ${seasons.includes('spring') ? 'checked' : ''}>
                                🌼 Spring
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-season" value="summer" ${seasons.includes('summer') ? 'checked' : ''}>
                                🌴 Summer
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-season" value="autumn" ${seasons.includes('autumn') ? 'checked' : ''}>
                                🍂 Autumn
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-season" value="winter" ${seasons.includes('winter') ? 'checked' : ''}>
                                ❄️ Winter
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-season" value="all" ${seasons.includes('all') ? 'checked' : ''}>
                                🌏 All Seasons
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Occasion: <span class="form-hint">(Select multiple)</span></label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="casual" ${occasions.includes('casual') ? 'checked' : ''}>
                                👚 Casual
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="date" ${occasions.includes('date') ? 'checked' : ''}>
                                💕 Date
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="work" ${occasions.includes('work') ? 'checked' : ''}>
                                💼 Work
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="party" ${occasions.includes('party') ? 'checked' : ''}>
                                🎉 Party
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="formal" ${occasions.includes('formal') ? 'checked' : ''}>
                                👔 Formal Occasion
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="sport" ${occasions.includes('sport') ? 'checked' : ''}>
                                🏃 Sport
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="edit-outfit-occasion" value="all" ${occasions.includes('all') ? 'checked' : ''}>
                                🌏 All Occasions
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-outfit-notes">Notes:</label>
                        <textarea id="edit-outfit-notes" rows="3">${outfit.notes || ''}</textarea>
                    </div>
                    <div class="modal-outfit-items">
                        <h3>Outfit Items (Cannot be edited)</h3>
                        <div class="modal-items-grid">
                            ${(outfit.items && Array.isArray(outfit.items) ? outfit.items : []).map(item => {
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
                    <div class="button-group">
                        <button type="submit" class="btn-primary">Save Changes</button>
                        <button type="button" class="btn-secondary" id="cancel-edit-outfit">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        setupEditOutfitForm(outfit.id);
    } else {
        // 查看模式
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
                <div class="button-group" style="margin-top: 20px;">
                    <button class="btn-primary" id="edit-outfit-btn">Edit</button>
                </div>
            </div>
        `;
        
        document.getElementById('edit-outfit-btn').addEventListener('click', () => {
            showOutfitModal(outfit, true);
        });
    }
    outfitModal.style.display = 'block';
}

function setupEditOutfitForm(outfitId) {
    const form = document.getElementById('edit-outfit-form');
    const cancelBtn = document.getElementById('cancel-edit-outfit');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        try {
            const name = document.getElementById('edit-outfit-name').value.trim();
            const notes = document.getElementById('edit-outfit-notes').value.trim();
            
            const seasonCheckboxes = document.querySelectorAll('input[name="edit-outfit-season"]:checked');
            const seasons = Array.from(seasonCheckboxes).map(cb => cb.value);
            const season = seasons.length > 0 ? seasons : ['all'];
            
            const occasionCheckboxes = document.querySelectorAll('input[name="edit-outfit-occasion"]:checked');
            const occasions = Array.from(occasionCheckboxes).map(cb => cb.value);
            const occasion = occasions.length > 0 ? occasions : ['casual'];
            
            const updateData = {
                name: name.substring(0, 200),
                season: season,
                occasion: occasion,
                notes: notes.substring(0, 500)
            };
            
            console.log('[Saved] Updating outfit:', outfitId, updateData);
            const result = await WardrobeAPI.updateOutfit(outfitId, updateData);
            console.log('[Saved] Outfit updated successfully:', result);
            
            // 更新本地数据
            const outfitIndex = allOutfits.findIndex(o => o.id === outfitId);
            if (outfitIndex !== -1) {
                allOutfits[outfitIndex] = { ...allOutfits[outfitIndex], ...result };
            }
            
            // 重新应用过滤和显示
            applyFilters();
            
            Utils.showNotification('Outfit updated successfully!', 'success');
            outfitModal.style.display = 'none';
        } catch (error) {
            console.error('[Saved] Failed to update outfit:', error);
            Utils.showNotification('Failed to update outfit: ' + (error.message || 'Please try again'), 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            showOutfitModal(currentEditingOutfit, false);
        });
    }
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
