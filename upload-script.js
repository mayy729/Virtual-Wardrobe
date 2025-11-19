let currentUploadedImages = [];
let currentWearingPhoto = null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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
    let validFiles = [];
    let hasErrors = false;
    
    for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            Utils.showNotification(`"${file.name}" is not supported, only JPG, PNG, GIF, WebP are supported`, 'error');
            hasErrors = true;
            continue;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            Utils.showNotification(`"${file.name}" is too large (${fileSizeMB}MB), maximum supported is 5MB`, 'error');
            hasErrors = true;
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
        if (!hasErrors) {
            Utils.showNotification('Please select a valid image file', 'info');
        }
        return;
    }
    
    let processedCount = 0;
    for (const file of validFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                original: e.target.result,
                processed: e.target.result,
                id: Date.now() + Math.random(),
                fileName: file.name,
                fileSize: file.size
            };
            currentUploadedImages.push(imageData);
            processedCount++;
            
            if (processedCount === validFiles.length) {
                showPreview();
            }
        };
        reader.onerror = function() {
            Utils.showNotification(`Failed to read file "${file.name}"`, 'error');
            processedCount++;
            if (processedCount === validFiles.length && currentUploadedImages.length > 0) {
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
            <button type="button" class="btn-remove-bg" data-index="${index}">🪄 Remove Background</button>
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
            Utils.showNotification('Background removal failed, will use original image', 'error');
        } finally {
            overlay.style.display = 'none';
        }
    }
});

async function removeBackground(imageSrc) {
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
                    data[i + 3] = 0;
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
    removeBackgroundBtn.textContent = '🪄 Auto Cutout';
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
        const file = e.target.files[0];
        
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            Utils.showNotification('Wearing photo format not supported, only JPG, PNG, GIF, WebP are supported', 'error');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            Utils.showNotification(`Wearing photo is too large (${fileSizeMB}MB), maximum supported is 5MB`, 'error');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentWearingPhoto = e.target.result;
        };
        reader.onerror = function() {
            Utils.showNotification('Failed to read wearing photo', 'error');
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    }
});

uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (currentUploadedImages.length === 0) {
        Utils.showNotification('Please upload images first!', 'info');
        return;
    }

    const MAX_BASE64_SIZE = 10 * 1024 * 1024;
    const mainImage = currentUploadedImages[0].processed;
    
    if (mainImage.length > MAX_BASE64_SIZE) {
        Utils.showNotification('Image data is too large, please use a smaller image file', 'error');
        return;
    }
    
    if (currentWearingPhoto && currentWearingPhoto.length > MAX_BASE64_SIZE) {
        Utils.showNotification('Wearing photo data is too large, please use a smaller image file', 'error');
        return;
    }

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    const name = (document.getElementById('item-name').value || 'Unnamed Clothes').trim();
    const brand = (document.getElementById('item-brand').value || '').trim();
    const size = (document.getElementById('item-size').value || '').trim();
    const material = (document.getElementById('item-material').value || '').trim();
    const notes = (document.getElementById('item-notes').value || '').trim();
    
    const itemData = {
        name: name.substring(0, 200),
        season: document.getElementById('item-season').value || 'all',
        occasion: document.getElementById('item-occasion').value || 'casual',
        brand: brand.substring(0, 100),
        size: size.substring(0, 50),
        material: material.substring(0, 100),
        notes: notes.substring(0, 500),
        image: mainImage,
        originalImage: currentUploadedImages[0].original,
        wearingPhoto: currentWearingPhoto || null,
        dateAdded: new Date().toISOString()
    };
    
    try {
        await WardrobeAPI.createClothes(itemData);
        Utils.showNotification('Clothes saved to server!', 'success');
        uploadForm.reset();
        currentUploadedImages = [];
        currentWearingPhoto = null;
        previewSection.style.display = 'none';
        itemDetailsForm.style.display = 'none';
        previewContainer.innerHTML = '';
    } catch (error) {
        console.error('Failed to save item:', error);
        const errorMessage = error.message || 'Save failed, please try again later.';
        Utils.showNotification(errorMessage, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Save Clothes';
    }
});

cancelBtn.addEventListener('click', function() {
    const confirmed = Utils.confirm ? Utils.confirm('Are you sure you want to cancel? The uploaded images will not be saved.') : confirm('Are you sure you want to cancel? The uploaded images will not be saved.');
    if (confirmed) {
        uploadForm.reset();
        currentUploadedImages = [];
        currentWearingPhoto = null;
        previewSection.style.display = 'none';
        itemDetailsForm.style.display = 'none';
        previewContainer.innerHTML = '';
    }
});
