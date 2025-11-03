let currentUploadedImages = [];
let currentWearingPhoto = null;

const uploadInput = document.getElementById('clothes-upload');
const uploadForm = document.getElementById('upload-form');
const previewSection = document.getElementById('preview-section');
const previewContainer = document.getElementById('preview-container');
const itemDetailsForm = document.getElementById('item-details-form');
const removeBackgroundBtn = document.getElementById('remove-background-btn');
const cancelBtn = document.getElementById('cancel-btn');
const wearingPhotoInput = document.getElementById('wearing-photo');
const wearingPhotoCheckbox = document.getElementById('item-wearing-photo');

document.querySelector('.upload-label').addEventListener('click', () => {
    uploadInput.click();
});

const uploadArea = document.querySelector('.upload-area');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        uploadInput.files = e.dataTransfer.files;
        handleFileUpload(e.dataTransfer.files);
    }
});

uploadInput.addEventListener('change', function(event) {
    handleFileUpload(event.target.files);
});

function handleFileUpload(files) {
    currentUploadedImages = [];
    
    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload image files!');
            continue;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                original: e.target.result,
                processed: e.target.result,
                id: Date.now() + Math.random()
            };
            currentUploadedImages.push(imageData);
            
            if (currentUploadedImages.length === files.length) {
                showPreview();
            }
        };
        reader.readAsDataURL(file);
    }

}

function showPreview() {
    previewSection.style.display = 'block';
    previewContainer.innerHTML = '';
    itemDetailsForm.style.display = 'block';
    
    currentUploadedImages.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <div class="preview-image-wrapper">
                <img src="${imageData.processed}" alt="Preview ${index + 1}">
                <div class="processing-overlay" style="display:none;">
                    <div class="spinner"></div>
                    <p>Processing...</p>
                </div>
            </div>
            <button type="button" class="btn-remove-bg" data-index="${index}">🎨 Remove Background</button>
        `;
        previewContainer.appendChild(previewItem);
    });
}

previewContainer.addEventListener('click', async function(e) {
    if (e.target.classList.contains('btn-remove-bg')) {
        const index = parseInt(e.target.dataset.index);
        const imageData = currentUploadedImages[index];
        const previewItem = e.target.closest('.preview-item');
        const overlay = previewItem.querySelector('.processing-overlay');
        const img = previewItem.querySelector('img');
        
        overlay.style.display = 'flex';
        
        try {
            const processedImage = await removeBackground(imageData.original);
            imageData.processed = processedImage;
            img.src = processedImage;
        } catch (error) {
            console.error('Background removal failed:', error);
            alert('Background removal failed, will use original image');
        } finally {
            overlay.style.display = 'none';
        }
    }
});

async function removeBackground(imageSrc) {
    // Method 1: Try using remove.bg API (requires API key)
    // Method 2: Use local Canvas processing (simplified version)
    
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                
                if (brightness > 200) {
                    data[i + 3] = 0; // alpha = 0 (transparent)
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => resolve(imageSrc);
    });
}

removeBackgroundBtn.addEventListener('click', async function() {
    if (currentUploadedImages.length === 0) return;
    
    removeBackgroundBtn.disabled = true;
    removeBackgroundBtn.textContent = 'Processing...';
    
    for (let i = 0; i < currentUploadedImages.length; i++) {
        const imageData = currentUploadedImages[i];
        const previewItem = previewContainer.children[i];
        const img = previewItem.querySelector('img');
        
        try {
            const processedImage = await removeBackground(imageData.original);
            imageData.processed = processedImage;
            img.src = processedImage;
        } catch (error) {
            console.error('Background removal failed:', error);
        }
    }
    
    removeBackgroundBtn.disabled = false;
    removeBackgroundBtn.textContent = '🎨 Auto Cutout';
});

wearingPhotoCheckbox.addEventListener('change', function() {
    if (this.checked) {
        wearingPhotoInput.click();
    } else {
        currentWearingPhoto = null;
    }
});

wearingPhotoInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentWearingPhoto = e.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (currentUploadedImages.length === 0) {
        alert('Please upload images first!');
        return;
    }
    
    const itemData = {
        name: document.getElementById('item-name').value || 'Unnamed Clothes',
        season: document.getElementById('item-season').value || 'all',
        occasion: document.getElementById('item-occasion').value || 'casual',
        brand: document.getElementById('item-brand').value || '',
        size: document.getElementById('item-size').value || '',
        material: document.getElementById('item-material').value || '',
        notes: document.getElementById('item-notes').value || '',
        image: currentUploadedImages[0].processed,
        originalImage: currentUploadedImages[0].original,
        wearingPhoto: currentWearingPhoto || null,
        id: Date.now(),
        dateAdded: new Date().toISOString()
    };
    
    const wardrobe = JSON.parse(localStorage.getItem('wardrobe') || '[]');
    wardrobe.push(itemData);
    localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
    
    alert('Clothes have been successfully saved!');
    
    uploadForm.reset();
    currentUploadedImages = [];
    currentWearingPhoto = null;
    previewSection.style.display = 'none';
    itemDetailsForm.style.display = 'none';
    previewContainer.innerHTML = '';
});

cancelBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to cancel? The uploaded images will not be saved.')) {
        uploadForm.reset();
        currentUploadedImages = [];
        currentWearingPhoto = null;
        previewSection.style.display = 'none';
        itemDetailsForm.style.display = 'none';
        previewContainer.innerHTML = '';
    }
});
