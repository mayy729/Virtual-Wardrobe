(() => {
    function getApiBase() {
        return window.API_BASE_URL || 'http://localhost:3000';
    }

    function buildUrl(path) {
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        return `${getApiBase()}${path}`;
    }

    async function request(path, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        };

        const url = buildUrl(path);
        
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMessage = errorJson.message || errorText;
                        } catch {
                            errorMessage = errorText;
                        }
                    }
                } catch {
                }
                throw new Error(errorMessage);
            }
            if (response.status === 204) {
                return null;
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const apiBase = getApiBase();
                throw new Error(`Unable to connect to the server (${apiBase}). Please check if the server is running.`);
            }
            console.error('[WardrobeAPI]', url, error);
            throw error;
        }
    }

    window.WardrobeAPI = {
        async listClothes() {
            return request('/api/clothes');
        },

        async createClothes(payload) {
            return request('/api/clothes', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        },

        async updateClothes(id, payload) {
            return request(`/api/clothes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        },

        async deleteClothes(id) {
            return request(`/api/clothes/${id}`, {
                method: 'DELETE'
            });
        },

        async listOutfits() {
            return request('/api/outfits');
        },

        async createOutfit(payload) {
            return request('/api/outfits', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        },

        async updateOutfit(id, payload) {
            return request(`/api/outfits/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        },

        async deleteOutfit(id) {
            return request(`/api/outfits/${id}`, {
                method: 'DELETE'
            });
        }
    };
})();

