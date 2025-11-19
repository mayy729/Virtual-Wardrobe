window.addEventListener('DOMContentLoaded', () => {
    checkApiConfig();
    updateStats();
    
    window.addEventListener('apiBaseChanged', () => {
        checkApiConfig();
        updateStats();
    });
});

function checkApiConfig() {
    const alert = document.getElementById('api-config-alert');
    const dismissBtn = document.getElementById('dismiss-alert');
    const configLink = document.getElementById('alert-config-link');
    const configBtn = document.getElementById('config-btn');
    
    if (!alert) return;
    
    if (window.API_BASE_REQUIRED || !window.API_BASE_URL) {
        const dismissed = localStorage.getItem('api_config_alert_dismissed');
        if (!dismissed) {
            alert.style.display = 'block';
        }
    } else {
        alert.style.display = 'none';
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            alert.style.display = 'none';
            localStorage.setItem('api_config_alert_dismissed', 'true');
        });
    }
    
    if (configLink && configBtn) {
        configLink.addEventListener('click', (e) => {
            e.preventDefault();
            configBtn.click();
        });
    }
}

async function updateStats() {
    const wardrobeCounter = document.getElementById('total-wardrobe-items');
    const savedCounter = document.getElementById('total-saved-outfits');

    wardrobeCounter.textContent = '...';
    savedCounter.textContent = '...';

    try {
        const [wardrobeItems, savedOutfits] = await Promise.all([
            WardrobeAPI.listClothes(),
            WardrobeAPI.listOutfits()
        ]);

        wardrobeCounter.textContent = wardrobeItems.length;
        savedCounter.textContent = savedOutfits.length;
    } catch (error) {
        console.error('Failed to load stats:', error);
        wardrobeCounter.textContent = '0';
        savedCounter.textContent = '0';
        if (window.Utils) {
            Utils.showNotification('Unable to connect to wardrobe service, please try again later.', 'error');
        }
    }
}
