(() => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const switchBackToLogin = document.getElementById('switch-back-to-login');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const forgotPasswordError = document.getElementById('forgot-password-error');

    // 切换登录/注册/忘记密码表单
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        forgotPasswordContainer.style.display = 'none';
        clearErrors();
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
        forgotPasswordContainer.style.display = 'none';
        clearErrors();
    });

    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'none';
        forgotPasswordContainer.style.display = 'block';
        clearErrors();
    });

    switchBackToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordContainer.style.display = 'none';
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
        clearErrors();
    });

    function clearErrors() {
        if (loginError) loginError.style.display = 'none';
        if (registerError) registerError.style.display = 'none';
        if (forgotPasswordError) forgotPasswordError.style.display = 'none';
    }

    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    // 登录表单提交
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError(loginError, 'Please enter your username and password.');
            return;
        }

        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const apiBase = window.API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // 保存 token 和用户信息
            localStorage.setItem('wardrobe_token', data.token);
            localStorage.setItem('wardrobe_user', JSON.stringify(data.user));

            // 跳转到首页
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            showError(loginError, error.message || 'Login failed, please check your username and password');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // 注册表单提交
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;

        // 验证
        if (username.length < 3 || username.length > 20) {
            showError(registerError, 'Username must be between 3 and 20 characters');
            return;
        }

        if (password.length < 6) {
            showError(registerError, 'Password must be at least 6 characters');
            return;
        }

        if (password !== passwordConfirm) {
            showError(registerError, 'The passwords you entered do not match');
            return;
        }

        const submitBtn = registerForm.querySelector('.btn-register');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            const apiBase = window.API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBase}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // 注册成功后自动登录
            localStorage.setItem('wardrobe_token', data.token);
            localStorage.setItem('wardrobe_user', JSON.stringify(data.user));

            // 跳转到首页
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Register error:', error);
            showError(registerError, error.message || 'Registration failed, please try again later');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // 忘记密码表单提交
    forgotPasswordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('reset-username').value.trim();
        const newPassword = document.getElementById('reset-new-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;

        if (!username) {
            showError(forgotPasswordError, 'Please enter your username');
            return;
        }

        if (newPassword.length < 6) {
            showError(forgotPasswordError, 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError(forgotPasswordError, 'The passwords you entered do not match');
            return;
        }

        const submitBtn = forgotPasswordForm.querySelector('.btn-reset-password');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Resetting...';

        try {
            const apiBase = window.API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBase}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            // 显示成功消息
            showError(forgotPasswordError, 'Password reset successfully! Redirecting to login...');
            forgotPasswordError.style.color = 'green';
            
            // 清空表单
            document.getElementById('reset-username').value = '';
            document.getElementById('reset-new-password').value = '';
            document.getElementById('reset-confirm-password').value = '';

            // 延迟后跳转到登录页面
            setTimeout(() => {
                forgotPasswordContainer.style.display = 'none';
                loginFormContainer.style.display = 'block';
                clearErrors();
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error);
            showError(forgotPasswordError, error.message || 'Password reset failed, please try again');
            forgotPasswordError.style.color = '';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reset Password';
        }
    });

    // 检查是否已登录
    const token = localStorage.getItem('wardrobe_token');
    if (token) {
        // 已登录，跳转到首页
        window.location.href = 'index.html';
    }
})();

