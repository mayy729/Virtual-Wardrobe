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
    // 注意：不需要为uploadLabel添加click事件，因为HTML中的<label for="clothes-upload">已经会自动触发文件选择
    // 如果添加click事件会导致双重触发（一次是label的for属性，一次是JavaScript事件）

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

// 防止重复处理文件的标志
let isProcessingFiles = false;

uploadInput.addEventListener('change', function(event) {
        console.log('[Upload] File input changed');
        
        // 防止重复触发
        if (isProcessingFiles) {
            console.log('[Upload] Already processing files, ignoring duplicate change event');
            return;
        }
        
        if (!event.target.files || event.target.files.length === 0) {
            console.log('[Upload] No files selected');
            return;
        }
        
        console.log('[Upload] Files selected:', event.target.files.length);
        isProcessingFiles = true;
        Utils.showNotification('Processing images...', 'info');
        
        // 添加小延迟，确保iOS能正确处理
        setTimeout(() => {
    handleFileUpload(event.target.files);
            // 处理完成后重置标志
            setTimeout(() => {
                isProcessingFiles = false;
            }, 500);
        }, 100);
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
                console.log('[Upload] Wearing photo file:', file.name, 'type:', file.type);
                
                if (!isValidImageFile(file)) {
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
            const type = (document.getElementById('item-type').value 
            || 'clothes').trim();
            const brand = (document.getElementById('item-brand').value || '').trim();
            const size = (document.getElementById('item-size').value || '').trim();
            const material = (document.getElementById('item-material').value || '').trim();
            const notes = (document.getElementById('item-notes').value || '').trim();
            
            // 收集选中的季节（多选）
            const seasonCheckboxes = document.querySelectorAll('input[name="item-season"]:checked');
            const seasons = Array.from(seasonCheckboxes).map(cb => cb.value);
            // 如果没有选择任何季节，默认使用 'all'
            const season = seasons.length > 0 ? seasons : ['all'];
            
            // 收集选中的场合（多选）
            const occasionCheckboxes = document.querySelectorAll('input[name="item-occasion"]:checked');
            const occasions = Array.from(occasionCheckboxes).map(cb => cb.value);
            // 如果没有选择任何场合，默认使用 'all'
            const occasion = occasions.length > 0 ? occasions : ['all'];
            
            const itemData = {
                name: name.substring(0, 200),
                type: type, // 'clothes' or 'accessories'
                season: season,
                occasion: occasion,
                brand: brand.substring(0, 100),
                size: size.substring(0, 50),
                material: material.substring(0, 100),
                notes: notes.substring(0, 500),
                // 只保存用于展示的主图，减少数据体积
                image: mainImage,
                // 不再保存 originalImage，避免单条数据过大
                wearingPhoto: currentWearingPhoto || null,
                dateAdded: new Date().toISOString()
            };
            
            try {
                console.log('[Upload] Submitting item data:', {
                    name: itemData.name,
                    size: itemData.size,
                    material: itemData.material,
                    brand: itemData.brand,
                    imageSize: mainImage.length
                });
                const result = await WardrobeAPI.createClothes(itemData);
                console.log('[Upload] Item saved successfully:', result);
                console.log('[Upload] Saved item size:', result.size, 'material:', result.material);
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

// 检查文件是否为图片（兼容iOS，iOS可能返回空type）
function isValidImageFile(file) {
    // 检查MIME类型
    const mimeType = file.type.toLowerCase();
    if (mimeType && ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        return true;
    }
    
    // iOS可能返回空type，通过文件扩展名检查
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasValidExtension) {
        return true;
    }
    
    // 如果type为空但有文件名，尝试读取文件头来判断
    // 对于iOS，我们更宽松一些，只要文件名看起来像图片就允许
    if (!mimeType && fileName.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
        return true;
    }
    
    return false;
}

function handleFileUpload(files) {
    currentUploadedImages = [];
    let validFiles = [];
    let hasErrors = false;
    
    console.log('[Upload] Processing files:', files.length);
    
    for (const file of files) {
        console.log('[Upload] File:', file.name, 'type:', file.type, 'size:', file.size);
        
        // 使用改进的文件验证
        if (!isValidImageFile(file)) {
            console.warn('[Upload] Invalid file type:', file.name, file.type);
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
    
    console.log('[Upload] Valid files:', validFiles.length);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const file of validFiles) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
            const imageData = {
                original: e.target.result,
                processed: e.target.result,
                    id: Date.now() + Math.random(),
                    fileName: file.name,
                    fileSize: file.size
            };
            currentUploadedImages.push(imageData);
                processedCount++;
                console.log('[Upload] Successfully processed:', file.name, processedCount, '/', validFiles.length);
                
                if (processedCount + errorCount === validFiles.length) {
                    // 重置处理标志
                    isProcessingFiles = false;
                    if (currentUploadedImages.length > 0) {
                        showPreview();
                    } else {
                        Utils.showNotification('Failed to process all images. Please try again.', 'error');
                    }
                }
            } catch (error) {
                console.error('[Upload] Error processing file:', file.name, error);
                errorCount++;
                Utils.showNotification(`Failed to process "${file.name}"`, 'error');
                if (processedCount + errorCount === validFiles.length) {
                    // 重置处理标志
                    isProcessingFiles = false;
                    if (currentUploadedImages.length > 0) {
                        showPreview();
                    } else {
                        Utils.showNotification('Failed to process all images. Please try again.', 'error');
                    }
                }
            }
        };
        
        reader.onerror = function(error) {
            console.error('[Upload] FileReader error for:', file.name, error);
            errorCount++;
            Utils.showNotification(`Failed to read file "${file.name}"`, 'error');
            if (processedCount + errorCount === validFiles.length) {
                // 重置处理标志
                isProcessingFiles = false;
                if (currentUploadedImages.length > 0) {
                    showPreview();
                } else {
                    Utils.showNotification('Failed to process all images. Please try again.', 'error');
                }
            }
        };
        
        reader.onabort = function() {
            console.warn('[Upload] File read aborted for:', file.name);
            errorCount++;
            if (processedCount + errorCount === validFiles.length) {
                // 重置处理标志
                isProcessingFiles = false;
                if (currentUploadedImages.length > 0) {
                showPreview();
                }
            }
        };
        
        try {
        reader.readAsDataURL(file);
        } catch (error) {
            console.error('[Upload] Error starting FileReader for:', file.name, error);
            errorCount++;
            Utils.showNotification(`Failed to read file "${file.name}"`, 'error');
            if (processedCount + errorCount === validFiles.length) {
                // 重置处理标志
                isProcessingFiles = false;
                if (currentUploadedImages.length > 0) {
                    showPreview();
                } else {
                    Utils.showNotification('Failed to process all images. Please try again.', 'error');
                }
            }
        }
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

// 注意：previewContainer 的事件监听器已经在 setupEventListeners() 中设置了
// 这里不需要重复设置

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

