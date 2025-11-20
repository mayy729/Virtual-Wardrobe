(() => {
    // 检查登录状态
    function checkAuth() {
        const token = localStorage.getItem('wardrobe_token');
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        
        // 如果不在登录页且未登录，跳转到登录页
        if (!token && !isLoginPage) {
            window.location.href = 'login.html';
            return false;
        }
        
        // 如果在登录页且已登录，跳转到首页
        if (token && isLoginPage) {
            window.location.href = 'index.html';
            return false;
        }
        
        return !!token;
    }

    // 显示用户信息（登出按钮已移至 Settings）
    function setupUserInfo() {
        const userStr = localStorage.getItem('wardrobe_user');
        if (!userStr) return;
        
        try {
            const user = JSON.parse(userStr);
            const nav = document.querySelector('nav ul');
            
            if (nav) {
                // 检查是否已有用户信息
                const existingUserInfo = document.getElementById('user-info');
                if (existingUserInfo) {
                    existingUserInfo.remove();
                }
                
                // 插入到导航栏末尾（在 Settings 之前）
                const settingsItem = nav.querySelector('li:last-child');
                if (settingsItem) {
                    nav.insertBefore(userInfo, settingsItem);
                } else {
                    nav.appendChild(userInfo);
                }
            }
        } catch (error) {
            console.error('Failed to parse user info:', error);
        }
    }

    // 页面加载时检查认证
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (checkAuth()) {
                setupUserInfo();
            }
        });
    } else {
        if (checkAuth()) {
            setupUserInfo();
        }
    }

    // 导出函数供其他脚本使用
    window.checkAuth = checkAuth;
    window.setupUserInfo = setupUserInfo;
})();

