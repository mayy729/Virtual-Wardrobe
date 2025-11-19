(() => {
    const configBtn = document.getElementById('config-btn');
    const configModal = document.getElementById('config-modal');
    const closeModal = configModal?.querySelector('.close-modal');
    const apiBaseInput = document.getElementById('api-base-input');
    const currentApiBase = document.getElementById('current-api-base');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const resetConfigBtn = document.getElementById('reset-config-btn');
    const configStatus = document.getElementById('config-status');

    if (!configBtn || !configModal) {
        return;
    }

    function updateCurrentApiBase() {
        if (currentApiBase && window.getWardrobeApiBase) {
            currentApiBase.textContent = window.getWardrobeApiBase();
        }
        if (apiBaseInput) {
            apiBaseInput.value = window.getWardrobeApiBase() || '';
        }
    }

    function showStatus(message, type = 'info') {
        if (!configStatus) return;
        configStatus.textContent = message;
        configStatus.className = `config-status status-${type}`;
        setTimeout(() => {
            configStatus.textContent = '';
            configStatus.className = 'config-status';
        }, 5000);
    }

    configBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateCurrentApiBase();
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

    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', async () => {
            const url = apiBaseInput.value.trim();
            if (!url) {
                showStatus('Please enter API Base URL', 'error');
                return;
            }

            testConnectionBtn.disabled = true;
            testConnectionBtn.textContent = 'Testing...';
            showStatus('Testing connection...', 'info');

            try {
                const result = await window.testWardrobeApiConnection?.();
                if (result) {
                    showStatus('Connection successful!', 'success');
                } else {
                    showStatus('Connection failed, please check if the server is running', 'error');
                }
            } catch (error) {
                showStatus('Connection test failed: ' + error.message, 'error');
            } finally {
                testConnectionBtn.disabled = false;
                testConnectionBtn.textContent = 'Test Connection';
            }
        });
    }

    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', async () => {
            const url = apiBaseInput.value.trim();
            if (!url) {
                showStatus('Please enter API Base URL', 'error');
                return;
            }

            saveConfigBtn.disabled = true;
            saveConfigBtn.textContent = 'Saving...';
            showStatus('Saving configuration...', 'info');

            try {
                const result = await window.setWardrobeApiBase(url);
                if (result.success) {
                    showStatus('Configuration saved!', 'success');
                    updateCurrentApiBase();
                    setTimeout(() => {
                        if (confirm('Configuration saved, do you want to refresh the page to apply the new configuration?')) {
                            window.location.reload();
                        }
                    }, 1000);
                } else {
                    showStatus('Save failed: ' + (result.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                showStatus('Save failed: ' + error.message, 'error');
            } finally {
                saveConfigBtn.disabled = false;
                saveConfigBtn.textContent = 'Save Configuration';
            }
        });
    }

    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset to default configuration?')) {
                window.resetWardrobeApiBase?.();
                updateCurrentApiBase();
                showStatus('Reset to default configuration', 'success');
                setTimeout(() => {
                    if (confirm('Configuration has been reset, do you want to refresh the page?')) {
                        window.location.reload();
                    }
                }, 1000);
            }
        });
    }

    updateCurrentApiBase();
})();

