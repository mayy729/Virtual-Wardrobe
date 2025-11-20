(() => {
    function getApiBase() {
        if (!window.API_BASE_URL) {
            throw new Error('The API Base URL is not configured. Please configure the backend server address in the settings, or specify it via the URL parameter ?apiBase=.');
        }
        return window.API_BASE_URL;
    }

    function buildUrl(path) {
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        return `${getApiBase()}${path}`;
    }

    function getAuthToken() {
        return localStorage.getItem('wardrobe_token');
    }

    async function request(path, options = {}) {
        const token = getAuthToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(token && { 'X-Auth-Token': token }),
                ...(options.headers || {})
            },
            ...options
        };

        const url = buildUrl(path);
        
        try {
            const response = await fetch(url, config);
            
            // 如果返回 401，说明 token 无效或过期，清除本地存储并跳转到登录页
            if (response.status === 401) {
                localStorage.removeItem('wardrobe_token');
                localStorage.removeItem('wardrobe_user');
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error('Login expired, please login again');
            }
            
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
        },

        // 认证相关 API
        async login(username, password) {
            return request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        async register(username, password) {
            return request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        async logout() {
            try {
                await request('/api/auth/logout', {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout failed:', error);
            } finally {
                localStorage.removeItem('wardrobe_token');
                localStorage.removeItem('wardrobe_user');
            }
        },

        async getCurrentUser() {
            return request('/api/auth/me');
        },

        async updateUser(updates) {
            return request('/api/auth/me', {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        },

        async changePassword(oldPassword, newPassword) {
            return request('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ oldPassword, newPassword })
            });
        },

        async resetPassword(username, newPassword) {
            return request('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ username, newPassword })
            });
        },

        isAuthenticated() {
            return !!getAuthToken();
        }
    };
})();

