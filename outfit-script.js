// 搭配创建页面专用脚本
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

// 加载衣柜数据
function loadWardrobeForOutfit() {
    const wardrobe = JSON.parse(localStorage.getItem('wardrobe') || '[]');
    availableItems = wardrobe;
    filterAndDisplayItems();
}

// 筛选并显示物品
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

// 显示可选择的物品
function displaySelectableItems(items) {
    selectableWardrobe.innerHTML = '';
    
    if (items.length === 0) {
        selectableWardrobe.innerHTML = '<p class="empty-message">No clothing matching the criteria was found.</p>';
        return;
    }
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'selectable-item-card';
        itemCard.dataset.id = item.id;
        itemCard.draggable = true;
        
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-card-info">
                <p>${item.name}</p>
            </div>
        `;
        
        // 点击添加到搭配
        itemCard.addEventListener('click', () => {
            addItemToOutfit(item);
        });
        
        // 拖拽功能
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

// 添加到搭配区域
function addItemToOutfit(item) {
    // 检查是否已添加
    if (selectedItems.find(i => i.id === item.id)) {
        alert('This item is already in the outfit!');
        return;
    }
    
    selectedItems.push(item);
    updateOutfitArea();
}

// 更新搭配区域
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
    
    // 移除按钮事件
    outfitArea.querySelectorAll('.btn-remove-from-outfit').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            selectedItems.splice(index, 1);
            updateOutfitArea();
        });
    });
}

// 拖拽放置功能
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

// 清空搭配
clearOutfitBtn.addEventListener('click', () => {
    if (selectedItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear the current outfit?')) {
        selectedItems = [];
        updateOutfitArea();
    }
});

// 保存搭配
saveOutfitBtn.addEventListener('click', () => {
    if (selectedItems.length === 0) {
        alert('Please select clothes to create an outfit!');
        return;
    }
    
    // 预设表单值
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

// 保存搭配表单提交
saveOutfitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const outfitData = {
        id: Date.now(),
        name: document.getElementById('outfit-name').value,
        season: document.getElementById('outfit-season').value,
        occasion: document.getElementById('outfit-occasion').value,
        notes: document.getElementById('outfit-notes').value || '',
        items: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image
        })),
        dateCreated: new Date().toISOString()
    };
    
    // 保存到本地存储
    const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
    savedOutfits.push(outfitData);
    localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));
    
    alert('Outfit has been successfully saved!');
    
    // 重置
    selectedItems = [];
    updateOutfitArea();
    saveOutfitForm.reset();
    saveOutfitModal.style.display = 'none';
});

// 关闭模态框
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

// 筛选器事件
outfitFilterSeason.addEventListener('change', filterAndDisplayItems);
outfitFilterOccasion.addEventListener('change', filterAndDisplayItems);

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', loadWardrobeForOutfit);
