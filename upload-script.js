let currentUploadedImages = [];
let currentWearingPhoto = null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

let uploadInput, uploadForm, previewSection, previewContainer, itemDetailsForm;
let removeBackgroundBtn, cancelBtn, wearingPhotoInput, wearingPhotoCheckbox;

function initUploadElements() {
    uploadInput = document.getElementById('clothes-upload');
    uploadForm = document.getElementById('upload-form');
    previewSection = document.getElementById('preview-section');
    previewContainer = document.getElementById('preview-container');
    itemDetailsForm = document.getElementById('item-details-form');
    removeBackgroundBtn = document.getElementById('remove-background-btn');
    cancelBtn = document.getElementById('cancel-btn');
    wearingPhotoInput = document.getElementById('wearing-photo');
    wearingPhotoCheckbox = document.getElementById('item-wearing-photo');
    
    if (!uploadInput || !uploadForm || !previewSection || !previewContainer || !itemDetailsForm) {
        console.error('[Upload] Required elements not found!', {
            uploadInput: !!uploadInput,
            uploadForm: !!uploadForm,
            previewSection: !!previewSection,
            previewContainer: !!previewContainer,
            itemDetailsForm: !!itemDetailsForm
        });
        return false;
    }
    
    setupEventListeners();
    
    console.log('[Upload] Initialization complete. Testing...');
    console.log('[Upload] Upload input exists:', !!uploadInput);
    console.log('[Upload] Utils exists:', typeof Utils !== 'undefined');
    console.log('[Upload] WardrobeAPI exists:', typeof WardrobeAPI !== 'undefined');
    
    return true;
}

function setupEventListeners() {
    const uploadLabel = document.querySelector('.upload-label');
    if (uploadLabel) {
        uploadLabel.addEventListener('click', () => {
            uploadInput.click();
        });
    }
    
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
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
    }
    
    uploadInput.addEventListener('change', function(event) {
        console.log('[Upload] ===== FILE INPUT CHANGE EVENT TRIGGERED =====');
        console.log('[Upload] Event:', event);
        console.log('[Upload] Files:', event.target.files);
        console.log('[Upload] Files length:', event.target.files ? event.target.files.length : 0);
        
        if (!event.target.files || event.target.files.length === 0) {
            console.warn('[Upload] No files selected - user may have cancelled');
            return;
        }
        
        console.log('[Upload] Files selected, showing notification...');
        try {
            Utils.showNotification('Processing images...', 'info');
        } catch (e) {
            console.error('[Upload] Failed to show notification:', e);
            alert('Processing images...'); 
        }
        
        const files = Array.from(event.target.files);
        console.log('[Upload] Calling handleFileUpload with', files.length, 'files');
        handleFileUpload(files);
    });
    
    console.log('[Upload] File input element:', uploadInput);
    console.log('[Upload] File input ID:', uploadInput.id);
    console.log('[Upload] File input type:', uploadInput.type);
    
    if (window.location.search.includes('debug=upload')) {
        console.log('[Upload] Debug mode enabled');
        window.testUpload = function() {
            console.log('[Upload] Manual test triggered');
            const testEvent = new Event('change', { bubbles: true });
            uploadInput.dispatchEvent(testEvent);
        };
    }
    
    if (removeBackgroundBtn) {
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
    }
    
    if (wearingPhotoCheckbox) {
        wearingPhotoCheckbox.addEventListener('change', function() {
            if (this.checked) {
                wearingPhotoInput.click();
            } else {
                currentWearingPhoto = null;
            }
        });
    }
    
    if (wearingPhotoInput) {
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
    }
    
    if (previewContainer) {
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
    }
    
    if (uploadForm) {
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
                console.log('[Upload] Submitting item data, image size:', mainImage.length, 'bytes');
                const result = await WardrobeAPI.createClothes(itemData);
                console.log('[Upload] Item saved successfully:', result);
                Utils.showNotification('Clothes saved to server!', 'success');
                uploadForm.reset();
                currentUploadedImages = [];
                currentWearingPhoto = null;
                previewSection.style.display = 'none';
                itemDetailsForm.style.display = 'none';
                previewContainer.innerHTML = '';
                uploadInput.value = '';
                wearingPhotoInput.value = '';
            } catch (error) {
                console.error('[Upload] Failed to save item:', error);
                console.error('[Upload] Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                let errorMessage = 'Save failed, please try again later.';
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Cannot connect to server. Please check your API configuration in Settings.';
                }
                Utils.showNotification(errorMessage, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Save Clothes';
            }
        });
    }
    
    if (cancelBtn) {
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
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Upload] DOM loaded, initializing...');
        if (!initUploadElements()) {
            console.error('[Upload] Failed to initialize upload elements');
            if (window.Utils) {
                Utils.showNotification('Failed to initialize upload form. Please refresh the page.', 'error');
            }
        } else {
            console.log('[Upload] Upload elements initialized successfully');
        }
    });
} else {
    console.log('[Upload] DOM already loaded, initializing...');
    if (!initUploadElements()) {
        console.error('[Upload] Failed to initialize upload elements');
        if (window.Utils) {
            Utils.showNotification('Failed to initialize upload form. Please refresh the page.', 'error');
        }
    } else {
        console.log('[Upload] Upload elements initialized successfully');
    }
}

window.handleFileUploadDirect = function(files) {
    console.log('[Upload] handleFileUploadDirect called (HTML onchange fallback)');
    if (typeof handleFileUpload === 'function') {
        handleFileUpload(files);
    } else {
        console.error('[Upload] handleFileUpload function not available yet');
        alert('Please wait for page to load completely, then try again.');
    }
};

function handleFileUpload(files) {
    console.log('[Upload] handleFileUpload called with', files.length, 'files');
    currentUploadedImages = [];
    let validFiles = [];
    let hasErrors = false;
    
    for (const file of files) {
        console.log('[Upload] Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const isImageByExtension = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileExtension);
        const isValidType = file.type && ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
        
        if (!isValidType && !isImageByExtension) {
            console.warn('[Upload] File type not supported:', file.type, fileExtension);
            Utils.showNotification(`"${file.name}" format not supported, only JPG, PNG, GIF, WebP are supported`, 'error');
            hasErrors = true;
            continue;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            console.warn('[Upload] File too large:', fileSizeMB, 'MB');
            Utils.showNotification(`"${file.name}" is too large (${fileSizeMB}MB), maximum supported is 5MB`, 'error');
            hasErrors = true;
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
        console.warn('[Upload] No valid files after validation');
        if (!hasErrors) {
            Utils.showNotification('Please select a valid image file', 'info');
        }
        return;
    }
    
    console.log('[Upload] Starting to read', validFiles.length, 'valid files');
    let processedCount = 0;
    let errorCount = 0;
    
    for (const file of validFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('[Upload] File read successfully:', file.name, 'Data length:', e.target.result.length);
            const imageData = {
                original: e.target.result,
                processed: e.target.result,
                id: Date.now() + Math.random(),
                fileName: file.name,
                fileSize: file.size
            };
            currentUploadedImages.push(imageData);
            processedCount++;
            
            console.log('[Upload] Processed', processedCount, 'of', validFiles.length);
            if (processedCount === validFiles.length) {
                console.log('[Upload] All files processed, showing preview');
                showPreview();
            }
        };
        reader.onerror = function(error) {
            console.error('[Upload] FileReader error for', file.name, ':', error);
            console.error('[Upload] FileReader error details:', {
                error: error,
                file: {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }
            });
            
            let errorMsg = `Failed to read "${file.name}". `;
            if (file.type && file.type.includes('heic')) {
                errorMsg += 'HEIC format may not be supported. Please convert to JPG or PNG first.';
            } else {
                errorMsg += 'Please try a different image or convert the image format.';
            }
            Utils.showNotification(errorMsg, 'error');
            
            errorCount++;
            processedCount++;
            if (processedCount === validFiles.length) {
                if (currentUploadedImages.length > 0) {
                    console.log('[Upload] Some files processed, showing preview');
                    showPreview();
                } else {
                    console.error('[Upload] No files were successfully processed');
                    Utils.showNotification('All images failed to load. Please try selecting different images or check if the images are corrupted.', 'error');
                }
            }
        };
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                console.log('[Upload] Reading', file.name, ':', percent + '%');
            }
        };
        try {
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('[Upload] Exception reading file', file.name, ':', error);
            Utils.showNotification(`Error processing "${file.name}": ${error.message}`, 'error');
            processedCount++;
            if (processedCount === validFiles.length && currentUploadedImages.length > 0) {
                showPreview();
            }
        }
    }
}

function showPreview() {
    console.log('[Upload] showPreview called, images count:', currentUploadedImages.length);
    
    if (currentUploadedImages.length === 0) {
        console.error('[Upload] No images to preview!');
        Utils.showNotification('No images were loaded. Please try selecting images again.', 'error');
        return;
    }
    
    try {
        previewSection.style.display = 'block';
        previewContainer.innerHTML = '';
        itemDetailsForm.style.display = 'block';
        
        console.log('[Upload] Preview section and form should now be visible');
        
        currentUploadedImages.forEach((imageData, index) => {
            console.log('[Upload] Creating preview for image', index, 'Data length:', imageData.processed.length);
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            if (!imageData.processed || imageData.processed.length === 0) {
                console.error('[Upload] Image data is empty for index', index);
                Utils.showNotification(`Image ${index + 1} data is invalid`, 'error');
                return;
            }
            
            previewItem.innerHTML = `
                <div class="preview-image-wrapper">
                    <img src="${imageData.processed}" alt="Preview ${index + 1}" onerror="console.error('[Upload] Image load error for index ${index}'); Utils.showNotification('Failed to display image ${index + 1}', 'error');">
                    <div class="processing-overlay" style="display:none;">
                        <div class="loading-spinner"></div>
                        <p>Processing...</p>
                    </div>
                </div>
                <button type="button" class="btn-remove-bg" data-index="${index}">🪄 Remove Background</button>
            `;
            previewContainer.appendChild(previewItem);
        });
        
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        console.log('[Upload] Preview displayed successfully');
        Utils.showNotification(`Loaded ${currentUploadedImages.length} image(s). Please fill in the details below.`, 'success');
    } catch (error) {
        console.error('[Upload] Error in showPreview:', error);
        Utils.showNotification('Failed to display preview: ' + error.message, 'error');
    }
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

