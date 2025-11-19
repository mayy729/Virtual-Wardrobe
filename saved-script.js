let allOutfits = [];
let filteredOutfits = [];

const savedOutfitsGrid = document.getElementById('saved-outfits-grid');
const outfitSearch = document.getElementById('outfit-search');
const savedFilterSeason = document.getElementById('saved-filter-season');
const savedFilterOccasion = document.getElementById('saved-filter-occasion');
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
                    <span class="tag tag-season">${getSeasonLabel(outfit.season)}</span>
                    <span class="tag tag-occasion">${getOccasionLabel(outfit.occasion)}</span>
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
    const searchTerm = outfitSearch.value.toLowerCase();
    const season = savedFilterSeason.value;
    const occasion = savedFilterOccasion.value;
    
    filteredOutfits = allOutfits.filter(outfit => {
        const matchesSearch = !searchTerm || 
            outfit.name.toLowerCase().includes(searchTerm) ||
            outfit.notes.toLowerCase().includes(searchTerm);
        
        const matchesSeason = !season || outfit.season === season || outfit.season === 'all';
        const matchesOccasion = !occasion || outfit.occasion === occasion;
        
        return matchesSearch && matchesSeason && matchesOccasion;
    });
    
    displayOutfits();
}

outfitSearch.addEventListener('input', applyFilters);
savedFilterSeason.addEventListener('change', applyFilters);
savedFilterOccasion.addEventListener('change', applyFilters);

clearSavedFilters.addEventListener('click', function() {
    outfitSearch.value = '';
    savedFilterSeason.value = '';
    savedFilterOccasion.value = '';
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
                <span class="tag tag-season">${getSeasonLabel(outfit.season)}</span>
                <span class="tag tag-occasion">${getOccasionLabel(outfit.occasion)}</span>
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
