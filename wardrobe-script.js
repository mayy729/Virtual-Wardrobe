let allItems = [];
let filteredItems = [];

const searchInput = document.getElementById('search-input');
const filterSeason = document.getElementById('filter-season');
const filterOccasion = document.getElementById('filter-occasion');
const filterBrand = document.getElementById('filter-brand');
const filterSize = document.getElementById('filter-size');
const filterMaterial = document.getElementById('filter-material');
const clearFiltersBtn = document.getElementById('clear-filters');
const wardrobeItems = document.getElementById('wardrobe-items');
const itemModal = document.getElementById('item-modal');
const closeModal = document.querySelector('.close-modal');

function loadWardrobe() {
    const wardrobe = JSON.parse(localStorage.getItem('wardrobe') || '[]');
    allItems = wardrobe;
    filteredItems = [...allItems];
    displayItems();
    updateStats();
}

function displayItems() {
    if (filteredItems.length === 0) {
        wardrobeItems.innerHTML = '<p class="empty-message">No items found that match the criteria</p>';
        return;
    }

    wardrobeItems.innerHTML = '';
    
    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'wardrobe-item-card';
        itemCard.dataset.id = item.id;
        
        itemCard.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${item.image}" alt="${item.name}">
                ${item.wearingPhoto ? '<span class="wearing-photo-badge">📷</span>' : ''}
            </div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="item-tags">
                    ${item.season ? `<span class="tag tag-season">${getSeasonLabel(item.season)}</span>` : ''}
                    ${item.occasion ? `<span class="tag tag-occasion">${getOccasionLabel(item.occasion)}</span>` : ''}
                    ${item.brand ? `<span class="tag tag-brand">${item.brand}</span>` : ''}
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
}

function getSeasonLabel(season) {
    const labels = {
        spring: '🌸 Spring',
        summer: '☀️ Summer',
        autumn: '🍂 Autumn',
        winter: '❄️ Winter',
        all: '🌟 All Seasons'
    };
    return labels[season] || season;
}

function getOccasionLabel(occasion) {
    const labels = {
        casual: '👕 Casual',
        date: '💕 Date',
        work: '💼 Work',
        party: '🎉 Party',
        formal: '👔 Formal Occasion',
        sport: '🏃 Sport'
    };
    return labels[occasion] || occasion;
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const season = filterSeason.value;
    const occasion = filterOccasion.value;
    const brand = filterBrand.value.toLowerCase();
    const size = filterSize.value.toLowerCase();
    const material = filterMaterial.value.toLowerCase();
    
    filteredItems = allItems.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.brand.toLowerCase().includes(searchTerm) ||
            item.notes.toLowerCase().includes(searchTerm);
        
        const matchesSeason = !season || item.season === season || item.season === 'all';
        
        const matchesOccasion = !occasion || item.occasion === occasion;
        
        const matchesBrand = !brand || item.brand.toLowerCase().includes(brand);
        
        const matchesSize = !size || item.size.toLowerCase().includes(size);
        
        const matchesMaterial = !material || item.material.toLowerCase().includes(material);
        
        return matchesSearch && matchesSeason && matchesOccasion && 
               matchesBrand && matchesSize && matchesMaterial;
    });
    
    displayItems();
    updateStats();
}

function updateStats() {
    document.getElementById('total-items').textContent = allItems.length;
    document.getElementById('filtered-items').textContent = filteredItems.length;
}

searchInput.addEventListener('input', applyFilters);
filterSeason.addEventListener('change', applyFilters);
filterOccasion.addEventListener('change', applyFilters);
filterBrand.addEventListener('input', applyFilters);
filterSize.addEventListener('input', applyFilters);
filterMaterial.addEventListener('input', applyFilters);

clearFiltersBtn.addEventListener('click', function() {
    searchInput.value = '';
    filterSeason.value = '';
    filterOccasion.value = '';
    filterBrand.value = '';
    filterSize.value = '';
    filterMaterial.value = '';
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
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(itemId);
        }
    }
});

function showItemModal(item) {
    const modalBody = document.getElementById('modal-body');
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
                        <span class="detail-value">${getSeasonLabel(item.season)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Occasion:</span>
                        <span class="detail-value">${getOccasionLabel(item.occasion)}</span>
                    </div>
                    ${item.brand ? `
                        <div class="detail-item">
                            <span class="detail-label">Brand:</span>
                            <span class="detail-value">${item.brand}</span>
                        </div>
                    ` : ''}
                    ${item.size ? `
                        <div class="detail-item">
                            <span class="detail-label">Size:</span>
                            <span class="detail-value">${item.size}</span>
                        </div>
                    ` : ''}
                    ${item.material ? `
                        <div class="detail-item">
                            <span class="detail-label">Material:</span>
                            <span class="detail-value">${item.material}</span>
                        </div>
                    ` : ''}
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
            </div>
        </div>
    `;
    itemModal.style.display = 'block';
}

closeModal.addEventListener('click', function() {
    itemModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === itemModal) {
        itemModal.style.display = 'none';
    }
});

function deleteItem(itemId) {
    allItems = allItems.filter(item => item.id !== itemId);
    localStorage.setItem('wardrobe', JSON.stringify(allItems));
    loadWardrobe();
}

window.addEventListener('DOMContentLoaded', loadWardrobe);
