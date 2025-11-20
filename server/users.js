const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// 确保用户文件存在
function ensureUsersFile() {
    if (fs.existsSync(USERS_FILE)) {
        return;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 确保会话文件存在
function ensureSessionsFile() {
    if (fs.existsSync(SESSIONS_FILE)) {
        return;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// 读取用户数据
function readUsers() {
    ensureUsersFile();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
}

// 写入用户数据
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// 读取会话数据
function readSessions() {
    ensureSessionsFile();
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
}

// 写入会话数据
function writeSessions(sessions) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

// 生成密码哈希
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// 生成 token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// 注册新用户
function registerUser(username, password) {
    const users = readUsers();
    
    // 检查用户名是否已存在
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already exists.');
    }
    
    // 验证用户名和密码
    if (username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters.');
    }
    
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: username.trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    return {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt
    };
}

// 登录用户
function loginUser(username, password) {
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new Error('Invalid username or password.');
    }
    
    // 生成 token
    const token = generateToken();
    const sessions = readSessions();
    
    // 保存会话（24小时有效期）
    sessions[token] = {
        userId: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    writeSessions(sessions);
    
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        }
    };
}

// 验证 token
function verifyToken(token) {
    if (!token) {
        return null;
    }
    
    const sessions = readSessions();
    const session = sessions[token];
    
    if (!session) {
        return null;
    }
    
    // 检查是否过期
    if (new Date(session.expiresAt) < new Date()) {
        delete sessions[token];
        writeSessions(sessions);
        return null;
    }
    
    return session;
}

// 登出用户
function logoutUser(token) {
    const sessions = readSessions();
    if (sessions[token]) {
        delete sessions[token];
        writeSessions(sessions);
    }
}

// 清理过期会话
function cleanExpiredSessions() {
    const sessions = readSessions();
    const now = new Date();
    let cleaned = false;
    
    for (const token in sessions) {
        if (new Date(sessions[token].expiresAt) < now) {
            delete sessions[token];
            cleaned = true;
        }
    }
    
    if (cleaned) {
        writeSessions(sessions);
    }
}

// 更新用户信息
function updateUser(userId, updates) {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        throw new Error('User not found');
    }
    
    const user = users[userIndex];
    
    // 更新用户名
    if (updates.username !== undefined) {
        const newUsername = updates.username.trim();
        if (newUsername.length < 3 || newUsername.length > 20) {
            throw new Error('Username must be between 3 and 20 characters.');
        }
        
        // 检查新用户名是否已被其他用户使用
        if (users.find(u => u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase())) {
            throw new Error('Username already exists.');
        }
        
        user.username = newUsername;
        
        // 更新所有会话中的用户名
        const sessions = readSessions();
        for (const token in sessions) {
            if (sessions[token].userId === userId) {
                sessions[token].username = newUsername;
            }
        }
        writeSessions(sessions);
    }
    
    // 更新头像
    if (updates.avatar !== undefined) {
        user.avatar = updates.avatar;
    }
    
    writeUsers(users);
    
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        createdAt: user.createdAt
    };
}

// 修改密码
function changePassword(userId, oldPassword, newPassword) {
    const users = readUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        throw new Error('User not found');
    }
    
    // 验证旧密码
    if (!verifyPassword(oldPassword, user.passwordHash)) {
        throw new Error('Current password is incorrect.');
    }
    
    // 验证新密码
    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
    }
    
    // 更新密码
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    
    return true;
}

// 检查用户名是否可用
function isUsernameAvailable(username) {
    if (!username || username.trim().length === 0) {
        return false;
    }
    
    const users = readUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const exists = users.find(u => u.username.toLowerCase() === normalizedUsername);
    
    return !exists;
}

// 获取用户信息
function getUserById(userId) {
    const users = readUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return null;
    }
    
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        createdAt: user.createdAt
    };
}

// 重置密码（忘记密码功能）
function resetPassword(username, newPassword) {
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        throw new Error('Username not found.');
    }
    
    // 验证新密码
    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
    }
    
    // 更新密码
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    
    // 清除该用户的所有会话（强制重新登录）
    const sessions = readSessions();
    let cleared = false;
    for (const token in sessions) {
        if (sessions[token].userId === user.id) {
            delete sessions[token];
            cleared = true;
        }
    }
    if (cleared) {
        writeSessions(sessions);
    }
    
    return {
        id: user.id,
        username: user.username
    };
}

// 定期清理过期会话（每小时）
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    logoutUser,
    updateUser,
    changePassword,
    getUserById,
    resetPassword,
    isUsernameAvailable
};

