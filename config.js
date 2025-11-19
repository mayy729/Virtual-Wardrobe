(() => {
    const STORAGE_KEY = 'wardrobe_api_base';
    const searchParams = new URLSearchParams(window.location.search);
    const paramBase = searchParams.get('apiBase');

    function isGitHubPages() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname.includes('github.com');
    }

    function getDefaultBase() {
        if (window.location.origin.includes('file://') || window.location.protocol === 'file:') {
            return 'http://localhost:3000';
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return window.location.origin;
        }
        if (isGitHubPages()) {
            return null;
        }
        return window.location.origin;
    }

    function validateApiBase(url) {
        if (!url) return false;
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    function cleanApiBase(url) {
        if (!url) return url;
        return url.replace(/\/+$/, '');
    }

    if (paramBase) {
        const cleaned = cleanApiBase(paramBase);
        if (validateApiBase(cleaned)) {
            localStorage.setItem(STORAGE_KEY, cleaned);
        }
    }

    const storedBase = localStorage.getItem(STORAGE_KEY);
    const defaultBase = getDefaultBase();
    const finalBase = cleanApiBase(storedBase || paramBase || defaultBase);

    if (!finalBase || !validateApiBase(finalBase)) {
        if (isGitHubPages() && !storedBase && !paramBase) {
            window.API_BASE_URL = null;
            window.API_BASE_REQUIRED = true;
            console.warn('[Config] GitHub Pages detected. Please configure API Base URL in Settings.');
        } else {
            window.API_BASE_URL = defaultBase || storedBase || 'http://localhost:3000';
        }
    } else {
        window.API_BASE_URL = finalBase;
        window.API_BASE_REQUIRED = false;
    }

    async function testApiConnection(baseUrl) {
        try {
            const response = await fetch(`${baseUrl}/`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok || response.status === 200;
        } catch (error) {
            console.warn('[Config] API connection test failed:', error.message);
            return false;
        }
    }

    window.setWardrobeApiBase = async function setWardrobeApiBase(newBase, skipTest = false) {
        if (!newBase) {
            localStorage.removeItem(STORAGE_KEY);
            const resetBase = getDefaultBase() || 'http://localhost:3000';
            window.API_BASE_URL = resetBase;
            window.API_BASE_REQUIRED = isGitHubPages() && !localStorage.getItem(STORAGE_KEY);
            return { success: true, url: resetBase };
        }

        const cleaned = cleanApiBase(newBase);
        if (!validateApiBase(cleaned)) {
            return { success: false, error: 'Invalid URL format' };
        }

        if (!skipTest) {
            const isConnected = await testApiConnection(cleaned);
            if (!isConnected) {
                return { 
                    success: false, 
                    error: 'Cannot connect to API server. Please check if the server is running.',
                    url: cleaned
                };
            }
        }

        localStorage.setItem(STORAGE_KEY, cleaned);
        window.API_BASE_URL = cleaned;
        window.API_BASE_REQUIRED = false;
        
        window.dispatchEvent(new CustomEvent('apiBaseChanged', { detail: { url: cleaned } }));
        
        return { success: true, url: cleaned };
    };

    window.getWardrobeApiBase = function getWardrobeApiBase() {
        return window.API_BASE_URL;
    };

    window.resetWardrobeApiBase = function resetWardrobeApiBase() {
        localStorage.removeItem(STORAGE_KEY);
        const resetBase = getDefaultBase() || 'http://localhost:3000';
        window.API_BASE_URL = resetBase;
        window.API_BASE_REQUIRED = isGitHubPages() && !localStorage.getItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('apiBaseChanged', { detail: { url: resetBase } }));
        return resetBase;
    };

    window.testWardrobeApiConnection = async function testWardrobeApiConnection() {
        return await testApiConnection(window.API_BASE_URL);
    };

    console.log('[Config] API Base URL:', window.API_BASE_URL);
})();

