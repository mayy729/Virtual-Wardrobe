(() => {
    const configBtn = document.getElementById('config-btn');
    const configModal = document.getElementById('config-modal');
    const closeModal = configModal?.querySelector('.close-modal');
    
    // Tab elements
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    // Personal Information elements
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarUpload = document.getElementById('avatar-upload');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    const usernameInput = document.getElementById('username-input');
    const savePersonalBtn = document.getElementById('save-personal-btn');
    const personalStatus = document.getElementById('personal-status');
    
    // Password Change elements
    const oldPasswordInput = document.getElementById('old-password-input');
    const newPasswordInput = document.getElementById('new-password-input');
    const confirmPasswordInput = document.getElementById('confirm-password-input');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordStatus = document.getElementById('password-status');
    
    // API Configuration elements (from config-ui.js)
    const apiBaseInput = document.getElementById('api-base-input');
    const currentApiBase = document.getElementById('current-api-base');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const resetConfigBtn = document.getElementById('reset-config-btn');
    const configStatus = document.getElementById('config-status');
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    
    if (!configBtn || !configModal) {
        return;
    }
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Load user information
    async function loadUserInfo() {
        try {
            const user = await WardrobeAPI.getCurrentUser();
            if (user) {
                usernameInput.value = user.username || '';
                
                // Load avatar
                if (user.avatar) {
                    avatarPreview.src = user.avatar;
                    avatarPreview.style.display = 'block';
                    avatarPlaceholder.style.display = 'none';
                } else {
                    avatarPreview.style.display = 'none';
                    avatarPlaceholder.style.display = 'block';
                }
                
                // Update localStorage
                localStorage.setItem('wardrobe_user', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }
    
    // Avatar upload
    uploadAvatarBtn?.addEventListener('click', () => {
        avatarUpload.click();
    });
    
    avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showStatus(personalStatus, 'Please select an image file', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showStatus(personalStatus, 'Image size must be less than 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            avatarPreview.src = imageData;
            avatarPreview.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
    
    // Save personal information
    savePersonalBtn?.addEventListener('click', async () => {
        const newUsername = usernameInput.value.trim();
        const avatarData = avatarPreview.style.display === 'block' ? avatarPreview.src : null;
        
        if (newUsername.length < 3 || newUsername.length > 20) {
            showStatus(personalStatus, 'Username must be between 3 and 20 characters', 'error');
            return;
        }
        
        savePersonalBtn.disabled = true;
        savePersonalBtn.textContent = 'Saving...';
        showStatus(personalStatus, 'Saving changes...', 'info');
        
        try {
            const updates = { username: newUsername };
            if (avatarData) {
                updates.avatar = avatarData;
            }
            
            const updatedUser = await WardrobeAPI.updateUser(updates);
            
            // Update localStorage
            localStorage.setItem('wardrobe_user', JSON.stringify(updatedUser));
            
            showStatus(personalStatus, 'Changes saved successfully!', 'success');
            
            // Update user info in navigation
            if (window.setupUserInfo) {
                window.setupUserInfo();
            }
        } catch (error) {
            showStatus(personalStatus, error.message || 'Failed to save changes', 'error');
        } finally {
            savePersonalBtn.disabled = false;
            savePersonalBtn.textContent = 'Save Changes';
        }
    });
    
    // Change password
    changePasswordBtn?.addEventListener('click', async () => {
        const oldPassword = oldPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!oldPassword || !newPassword || !confirmPassword) {
            showStatus(passwordStatus, 'Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showStatus(passwordStatus, 'New password must be at least 6 characters', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showStatus(passwordStatus, 'New passwords do not match', 'error');
            return;
        }
        
        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = 'Changing...';
        showStatus(passwordStatus, 'Changing password...', 'info');
        
        try {
            await WardrobeAPI.changePassword(oldPassword, newPassword);
            showStatus(passwordStatus, 'Password changed successfully!', 'success');
            
            // Clear password fields
            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } catch (error) {
            showStatus(passwordStatus, error.message || 'Failed to change password', 'error');
        } finally {
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = 'Change Password';
        }
    });
    
    // API Configuration (from config-ui.js)
    function updateCurrentApiBase() {
        if (currentApiBase && window.getWardrobeApiBase) {
            currentApiBase.textContent = window.getWardrobeApiBase() || 'Not configured';
        }
        if (apiBaseInput) {
            apiBaseInput.value = window.getWardrobeApiBase() || '';
        }
    }
    
    testConnectionBtn?.addEventListener('click', async () => {
        const url = apiBaseInput.value.trim();
        if (!url) {
            showStatus(configStatus, 'Please enter API Base URL', 'error');
            return;
        }
        
        testConnectionBtn.disabled = true;
        testConnectionBtn.textContent = 'Testing...';
        showStatus(configStatus, 'Testing connection...', 'info');
        
        try {
            const result = await window.testWardrobeApiConnection?.();
            if (result) {
                showStatus(configStatus, 'Connection successful!', 'success');
            } else {
                showStatus(configStatus, 'Connection failed, please check if the server is running', 'error');
            }
        } catch (error) {
            showStatus(configStatus, 'Connection test failed: ' + error.message, 'error');
        } finally {
            testConnectionBtn.disabled = false;
            testConnectionBtn.textContent = 'Test Connection';
        }
    });
    
    saveConfigBtn?.addEventListener('click', async () => {
        const url = apiBaseInput.value.trim();
        if (!url) {
            showStatus(configStatus, 'Please enter API Base URL', 'error');
            return;
        }
        
        saveConfigBtn.disabled = true;
        saveConfigBtn.textContent = 'Saving...';
        showStatus(configStatus, 'Saving configuration...', 'info');
        
        try {
            const result = await window.setWardrobeApiBase(url);
            if (result.success) {
                showStatus(configStatus, 'Configuration saved!', 'success');
                updateCurrentApiBase();
            } else {
                showStatus(configStatus, 'Save failed: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            showStatus(configStatus, 'Save failed: ' + error.message, 'error');
        } finally {
            saveConfigBtn.disabled = false;
            saveConfigBtn.textContent = 'Save Configuration';
        }
    });
    
    resetConfigBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset to default configuration?')) {
            window.resetWardrobeApiBase?.();
            updateCurrentApiBase();
            showStatus(configStatus, 'Reset to default configuration', 'success');
        }
    });
    
    // Logout
    logoutBtn?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to log out?')) {
            try {
                await WardrobeAPI.logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
            window.location.href = 'login.html';
        }
    });
    
    // Modal open/close
    configBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateCurrentApiBase();
        loadUserInfo();
        configModal.style.display = 'block';
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            configModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === configModal) {
            configModal.style.display = 'none';
        }
    });
    
    // Helper function to show status messages
    function showStatus(element, message, type = 'info') {
        if (!element) return;
        element.textContent = message;
        element.className = `config-status status-${type}`;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'config-status';
        }, 5000);
    }
    
    // Initialize
    updateCurrentApiBase();
})();

